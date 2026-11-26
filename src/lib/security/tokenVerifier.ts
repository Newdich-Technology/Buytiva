import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AccessTokenClaims } from './tokenSigner.js';

export function verifyAccessToken(token: string, secret: string, issuer: string): AccessTokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const headerPart = parts[0];
  const payloadPart = parts[1];
  const signaturePart = parts[2];
  if (!headerPart || !payloadPart || !signaturePart) return null;
  const signedContent = headerPart + '.' + payloadPart;
  const expected = createHmac('sha256', secret).update(signedContent).digest();
  const received = Buffer.from(signaturePart, 'base64url');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8')) as { alg?: string };
    const claims = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as AccessTokenClaims;
    const now = Math.floor(Date.now() / 1000);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (header.alg !== 'HS256' || claims.iss !== issuer || !Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.iat) ||
        !Number.isSafeInteger(claims.auth_time) || claims.exp <= now || claims.iat > now || claims.auth_time > now || claims.exp <= claims.iat) return null;
    if (typeof claims.sub !== 'string' || !uuid.test(claims.sub) || typeof claims.sid !== 'string' || !uuid.test(claims.sid) ||
        !Array.isArray(claims.amr) || !claims.amr.every((method) => typeof method === 'string')) return null;
    return claims;
  } catch {
    return null;
  }
}
