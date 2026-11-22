import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { AUTH_OTP_LENGTH } from '../../constants/auths/auth.constants.js';

export function generateEmailOtp(): string {
  return randomInt(0, 10 ** AUTH_OTP_LENGTH).toString().padStart(AUTH_OTP_LENGTH, '0');
}

export function createOtpDigest(input: {
  readonly challengeId: string;
  readonly email: string;
  readonly purpose: string;
  readonly code: string;
  readonly pepper: string;
}): string {
  return createHmac('sha256', input.pepper)
    .update([input.challengeId, input.email, input.purpose, input.code].join(':'))
    .digest('hex');
}

export function compareOtpDigests(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected, 'hex');
  const actualBytes = Buffer.from(actual, 'hex');
  return expectedBytes.length === actualBytes.length && timingSafeEqual(expectedBytes, actualBytes);
}
