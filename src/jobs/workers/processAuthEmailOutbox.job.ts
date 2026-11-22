import { randomUUID } from 'node:crypto';
import type { Logger } from 'pino';
import type { AuthConfig } from '../../configs/auth.config.js';
import type { EmailProvider, EmailMessage } from '../../interfaces/notifications/emailProvider.interface.js';
import { decryptSecret } from '../../lib/security/secretBox.js';
import { PrismaOutboxRepository } from '../../repositories/outbox/outbox.repository.js';
import { EmailOutboxError, invalidEmailOutboxContentError, invalidEmailOutboxPayloadError } from '../../errors/auths/emailOutbox.error.js';
import { AUTH_SECURITY_EVENT_CODES } from '../../constants/auths/auth.constants.js';

interface EncryptedEmailPayload {
  readonly encryptedMessage?: unknown;
}

export class ProcessAuthEmailOutboxJob {
  constructor(
    private readonly repository: PrismaOutboxRepository,
    private readonly provider: EmailProvider,
    private readonly config: AuthConfig,
    private readonly logger: Logger
  ) {}

  async runOnce(): Promise<boolean> {
    const claimed = await this.repository.claimNextEvent(new Date(), randomUUID());
    if (!claimed) return false;
    try {
      const payload = claimed.payload as EncryptedEmailPayload;
      if (typeof payload.encryptedMessage !== 'string') throw invalidEmailOutboxPayloadError();
      const message = JSON.parse(decryptSecret(payload.encryptedMessage, this.config.encryptionKey)) as EmailMessage;
      if (!message.to || !message.subject || !message.text) throw invalidEmailOutboxContentError();
      await this.provider.sendEmail(message);
      await this.repository.completeEvent(claimed.id, claimed.claimToken, new Date());
    } catch (error) {
      await this.repository.failEvent(claimed.id, claimed.claimToken, claimed.attempts, new Date());
      this.logger.warn({ eventId: claimed.id, errorCode: safeErrorCode(error) }, 'Authentication email delivery failed');
    }
    return true;
  }

  async drainAvailable(maximumEvents: number): Promise<number> {
    let processed = 0;
    while (processed < maximumEvents && await this.runOnce()) processed += 1;
    return processed;
  }
}

function safeErrorCode(error: unknown): string {
	return error instanceof EmailOutboxError ? error.code : AUTH_SECURITY_EVENT_CODES.emailProviderFailure;
}
