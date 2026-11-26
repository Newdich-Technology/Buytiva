import { createHmac, randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyAccessToken } from '../../../src/lib/security/tokenVerifier.js';

const secret = 'test-secret';
function token(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signed = `${header}.${body}`;
  return `${signed}.${createHmac('sha256', secret).update(signed).digest('base64url')}`;
}
describe('access token verification', () => {
  it('rejects malformed signed time and identity claims instead of accepting missing expiries', () => {
    const now = Math.floor(Date.now() / 1000);
    const valid = { iss: 'test', sub: randomUUID(), sid: randomUUID(), iat: now, exp: now + 60, auth_time: now, amr: ['pwd'] };
    expect(verifyAccessToken(token(valid), secret, 'test')).toMatchObject(valid);
    for (const change of [{ exp: undefined }, { exp: '9999999999' }, { iat: null }, { auth_time: now + 10 },
      { sub: 'not-uuid' }, { sid: 42 }, { amr: [1] }, { exp: now }, { exp: now - 1 }]) {
      expect(verifyAccessToken(token({ ...valid, ...change }), secret, 'test')).toBeNull();
    }
  });
});
