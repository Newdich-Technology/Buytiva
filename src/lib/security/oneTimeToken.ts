import { createHash, randomBytes } from 'node:crypto';

export interface OneTimeToken {
  readonly rawToken: string;
  readonly tokenHash: string;
}

export function generateOneTimeToken(byteLength = 32): OneTimeToken {
  const rawToken = randomBytes(byteLength).toString('base64url');
  return { rawToken, tokenHash: hashOneTimeToken(rawToken) };
}

export function hashOneTimeToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
