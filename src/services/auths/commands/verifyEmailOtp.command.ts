import { AUTH_OTP_MAX_ATTEMPTS } from '../../../constants/auths/auth.constants.js';
import { invalidChallengeError } from '../../../errors/auths/auth.error.js';
import { compareOtpDigests, createOtpDigest } from '../../../lib/security/otpHasher.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function verifyEmailOtpCommand(
  dependencies: AuthDependencies,
  input: { email: string; challengeId: string; code: string }
) {
  const emailNormalized = normalizeEmail(input.email);
  const challenge = await dependencies.repository.findOtpChallenge(
    input.challengeId,
    emailNormalized,
    'EMAIL_VERIFICATION'
  );
  const now = new Date();
  if (!challenge || !challenge.userId || challenge.expiresAt <= now || challenge.consumedAt || challenge.supersededAt || challenge.attempts >= AUTH_OTP_MAX_ATTEMPTS) {
    throw invalidChallengeError();
  }
  const actualDigest = createOtpDigest({
    challengeId: challenge.id,
    email: emailNormalized,
    purpose: challenge.purpose,
    code: input.code,
    pepper: dependencies.config.otpPepper
  });
  if (!compareOtpDigests(challenge.digest, actualDigest)) {
    await dependencies.repository.incrementOtpAttempt(challenge.id, challenge.attempts, now);
    throw invalidChallengeError();
  }
  const verified = await dependencies.repository.consumeEmailVerification(
    challenge.id,
    challenge.attempts,
    challenge.userId,
    now
  );
  if (!verified) throw invalidChallengeError();
  return { verified: true as const };
}
