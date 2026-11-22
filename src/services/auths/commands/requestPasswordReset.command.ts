import { randomUUID } from 'node:crypto';
import { AUTH_MINUTE_MS, AUTH_PASSWORD_RESET_MINUTES, AUTH_PASSWORD_RESET_PATH } from '../../../constants/auths/auth.constants.js';
import { createPasswordResetEmail } from '../../../lib/email/emailTemplates.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { generateOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function requestPasswordResetCommand(dependencies: AuthDependencies, email: string) {
  const token = generateOneTimeToken();
  const outbox = createEncryptedEmailOutboxMessage(
    dependencies.config,
    createPasswordResetEmail(normalizeEmail(email), dependencies.config.publicBaseUrl + AUTH_PASSWORD_RESET_PATH + '?token=' + encodeURIComponent(token.rawToken))
  );
  await dependencies.repository.requestPasswordReset(normalizeEmail(email), {
    id: randomUUID(),
    tokenHash: token.tokenHash,
    expiresAt: new Date(Date.now() + AUTH_PASSWORD_RESET_MINUTES * AUTH_MINUTE_MS),
    outbox
  });
  return { accepted: true as const, message: 'If the address is registered, password reset instructions will be sent.' };
}
