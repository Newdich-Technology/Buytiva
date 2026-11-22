import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { invalidEncryptedSecretError } from '../../errors/auths/auth.error.js';

export function encryptSecret(plaintext: string, key: Buffer): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [nonce, tag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decryptSecret(envelope: string, key: Buffer): string {
  const [nonceText, tagText, ciphertextText] = envelope.split('.');
  if (!nonceText || !tagText || !ciphertextText) throw invalidEncryptedSecretError();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(nonceText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}
