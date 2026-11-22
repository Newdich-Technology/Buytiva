import { randomUUID } from 'node:crypto';
import type { AuthConfig } from '../../configs/auth.config.js';
import type { EmailMessage } from '../../interfaces/notifications/emailProvider.interface.js';
import { encryptSecret } from '../security/secretBox.js';

export function createEncryptedEmailOutboxMessage(config: AuthConfig, message: EmailMessage) {
  const id = randomUUID();
  return {
    id,
    payload: encryptSecret(JSON.stringify(message), config.encryptionKey),
    dedupeKey: 'email:' + id
  };
}
