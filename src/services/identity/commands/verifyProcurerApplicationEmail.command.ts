import { AUTH_OTP_MAX_ATTEMPTS } from '../../../constants/auths/auth.constants.js';
import { applicationOtpInvalidError } from '../../../errors/identity/procurerApplication.error.js';
import { compareOtpDigests, createOtpDigest } from '../../../lib/security/otpHasher.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createApplicationEmail } from '../../../lib/email/emailTemplates.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function verifyProcurerApplicationEmailCommand(dependencies: AuthDependencies, input: { email: string; challengeId: string; code: string }) {
  const emailNormalized = normalizeEmail(input.email);
  const now = new Date();
  const challenge = await dependencies.identityRepository.findEmailChallenge(input.challengeId, emailNormalized, now);
  if (!challenge || challenge.attempts >= Math.min(challenge.maxAttempts, AUTH_OTP_MAX_ATTEMPTS)) throw applicationOtpInvalidError();
  const digest = createOtpDigest({ challengeId: challenge.id, email: emailNormalized, purpose: 'APPLICATION_EMAIL_VERIFICATION', code: input.code, pepper: dependencies.config.otpPepper });
  if (!compareOtpDigests(challenge.digest, digest)) {
    await dependencies.identityRepository.incrementEmailChallengeAttempt(challenge.id, challenge.attempts, now);
    throw applicationOtpInvalidError();
  }
  const confirmationOutbox = createEncryptedEmailOutboxMessage(dependencies.config, createApplicationEmail(challenge.applicantEmail, challenge.publicReference));
  const verified = await dependencies.identityRepository.consumeApplicationEmailChallenge(challenge.id, challenge.applicationId, challenge.attempts, confirmationOutbox, now);
  if (!verified) throw applicationOtpInvalidError();
  return { verified: true as const };
}
