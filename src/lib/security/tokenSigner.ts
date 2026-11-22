import { createHmac } from 'node:crypto';

export interface AccessTokenClaims {
  readonly sub: string;
  readonly sid: string;
  readonly iss: string;
  readonly iat: number;
  readonly exp: number;
  readonly auth_time: number;
  readonly amr: readonly string[];
}

export function signAccessToken(claims: AccessTokenClaims, secret: string): string {
  const header = encodeTokenPart(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeTokenPart(JSON.stringify(claims));
  const signedContent = header + '.' + payload;
  const signature = createHmac('sha256', secret).update(signedContent).digest('base64url');
  return signedContent + '.' + signature;
}

function encodeTokenPart(value: string): string {
  return Buffer.from(value).toString('base64url');
}
