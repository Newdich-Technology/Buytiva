import { randomUUID } from 'node:crypto';
import { AUTH_MINUTE_MS, AUTH_OTP_EXPIRY_MINUTES, AUTH_OTP_RESEND_SECONDS, AUTH_SECOND_MS } from '../../../constants/auths/auth.constants.js';
import { createVerificationEmail } from '../../../lib/email/emailTemplates.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createOtpDigest, generateEmailOtp } from '../../../lib/security/otpHasher.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function requestEmailOtpCommand(dependencies: AuthDependencies, email: string) {
  const emailNormalized = normalizeEmail(email);
  const account = await dependencies.repository.findAccountByEmail(emailNormalized);
  if (account && !account.emailVerifiedAt) {
    const id = randomUUID();
    const code = generateEmailOtp();
    const now = new Date();
    const outbox = createEncryptedEmailOutboxMessage(
      dependencies.config,
      createVerificationEmail(emailNormalized, code, AUTH_OTP_EXPIRY_MINUTES, id)
    );
    await dependencies.repository.createOtpChallenge({
      id,
      emailNormalized,
      purpose: 'EMAIL_VERIFICATION',
      digest: createOtpDigest({ challengeId: id, email: emailNormalized, purpose: 'EMAIL_VERIFICATION', code, pepper: dependencies.config.otpPepper }),
      userId: account.id,
      applicationId: null,
      expiresAt: new Date(now.getTime() + AUTH_OTP_EXPIRY_MINUTES * AUTH_MINUTE_MS),
      resendAt: new Date(now.getTime() + AUTH_OTP_RESEND_SECONDS * AUTH_SECOND_MS),
      outbox
    });
  }
  return { accepted: true as const, message: 'If a pending verification exists, a new message will be sent.' };
}
