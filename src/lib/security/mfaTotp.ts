import * as OTPAuth from 'otpauth';
import { AUTH_TOTP_DIGITS, AUTH_TOTP_ISSUER, AUTH_TOTP_PERIOD_SECONDS, AUTH_TOTP_WINDOW } from '../../constants/auths/auth.constants.js';

export interface TotpEnrollment {
  readonly secret: string;
  readonly uri: string;
}

export function createTotpEnrollment(email: string): TotpEnrollment {
  const secret = new OTPAuth.Secret({ size: 20 }).base32;
  const totp = createTotpAuthenticator(email, secret);
  return { secret, uri: totp.toString() };
}

export function verifyTotpCode(email: string, secret: string, code: string): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const authenticator = createTotpAuthenticator(email, secret);
  const delta = authenticator.validate({ token: code, window: AUTH_TOTP_WINDOW });
  if (delta === null) return null;
  return Math.floor(Date.now() / 1000 / AUTH_TOTP_PERIOD_SECONDS) + delta;
}

function createTotpAuthenticator(email: string, secret: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: AUTH_TOTP_ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: AUTH_TOTP_DIGITS,
    period: AUTH_TOTP_PERIOD_SECONDS,
    secret: OTPAuth.Secret.fromBase32(secret)
  });
}
