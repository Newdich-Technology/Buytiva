import { randomUUID } from 'node:crypto';
import { AUTH_APPLICATION_LOOKUP_MESSAGE, AUTH_MINUTE_MS, AUTH_OTP_EXPIRY_MINUTES, AUTH_OTP_RESEND_SECONDS, AUTH_SECOND_MS } from '../../../constants/auths/auth.constants.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createApplicationStatusLookupEmail } from '../../../lib/email/emailTemplates.js';
import { createOtpDigest, generateEmailOtp } from '../../../lib/security/otpHasher.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function requestApplicationStatusLookupCommand(dependencies: AuthDependencies, input: { email: string; reference: string }) {
  const emailNormalized = normalizeEmail(input.email);
  const id = randomUUID();
  const code = generateEmailOtp();
  const now = new Date();
  const outbox = createEncryptedEmailOutboxMessage(dependencies.config, createApplicationStatusLookupEmail(emailNormalized, code, AUTH_OTP_EXPIRY_MINUTES));
  await dependencies.identityRepository.createStatusLookup({
    id, emailNormalized, publicReference: input.reference.trim().toUpperCase(),
    digest: createOtpDigest({ challengeId: id, email: emailNormalized, purpose: 'APPLICATION_STATUS_LOOKUP', code, pepper: dependencies.config.otpPepper }),
    expiresAt: new Date(now.getTime() + AUTH_OTP_EXPIRY_MINUTES * AUTH_MINUTE_MS),
    resendAt: new Date(now.getTime() + AUTH_OTP_RESEND_SECONDS * AUTH_SECOND_MS), outbox, now
  });
  return { accepted: true as const, message: AUTH_APPLICATION_LOOKUP_MESSAGE, challengeId: id };
}
