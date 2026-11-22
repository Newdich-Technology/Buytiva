import { AUTH_OTP_MAX_ATTEMPTS } from '../../../constants/auths/auth.constants.js';
import { applicationOtpInvalidError } from '../../../errors/identity/procurerApplication.error.js';
import { compareOtpDigests, createOtpDigest } from '../../../lib/security/otpHasher.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function verifyApplicationStatusLookupQuery(dependencies: AuthDependencies, input: { email: string; challengeId: string; code: string }) {
  const now = new Date();
  const emailNormalized = normalizeEmail(input.email);
  const challenge = await dependencies.identityRepository.findStatusLookupChallenge({ id: input.challengeId, emailNormalized, now });
  if (!challenge || challenge.attempts >= Math.min(challenge.maxAttempts, AUTH_OTP_MAX_ATTEMPTS)) throw applicationOtpInvalidError();
  const digest = createOtpDigest({ challengeId: challenge.id, email: emailNormalized, purpose: 'APPLICATION_STATUS_LOOKUP', code: input.code, pepper: dependencies.config.otpPepper });
  if (!compareOtpDigests(challenge.digest, digest)) {
    await dependencies.identityRepository.incrementStatusLookupAttempt(challenge.id, challenge.attempts, now);
    throw applicationOtpInvalidError();
  }
  if (!(await dependencies.identityRepository.consumeStatusLookup(challenge.id, challenge.applicationId, challenge.attempts, now))) throw applicationOtpInvalidError();
  return { reference: challenge.reference, status: challenge.status, history: challenge.history.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })) };
}
