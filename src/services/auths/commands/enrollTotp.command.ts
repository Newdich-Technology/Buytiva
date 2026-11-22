import { randomUUID } from 'node:crypto';
import { AUTH_LOGIN_CHALLENGE_MINUTES, AUTH_MINUTE_MS, AUTH_OTP_MAX_ATTEMPTS } from '../../../constants/auths/auth.constants.js';
import { authenticatorAlreadyEnabledError, invalidChallengeError } from '../../../errors/auths/auth.error.js';
import { createTotpEnrollment } from '../../../lib/security/mfaTotp.js';
import { encryptSecret } from '../../../lib/security/secretBox.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function enrollTotpCommand(
  dependencies: AuthDependencies,
  input: { userId?: string; challengeToken?: string; currentPassword?: string }
) {
  let userId = input.userId;
  if (input.challengeToken) {
    const challenge = await dependencies.repository.findLoginChallenge(hashOneTimeToken(input.challengeToken));
    if (!challenge || challenge.purpose !== 'MFA_ENROLLMENT' || challenge.consumedAt || challenge.expiresAt <= new Date() || challenge.attempts >= AUTH_OTP_MAX_ATTEMPTS) {
      throw invalidChallengeError();
    }
    userId = challenge.userId;
  }
  if (!userId) throw invalidChallengeError();
  const account = await dependencies.repository.findAccountById(userId);
  if (!account) throw invalidChallengeError();
  if (input.userId && !input.challengeToken &&
    (!input.currentPassword || !account.passwordHash || !(await dependencies.passwordHasher.verifyPassword(account.passwordHash, input.currentPassword)))) {
    throw invalidChallengeError();
  }
  const current = await dependencies.repository.getMfaFactor(userId);
  if (current?.enabledAt) throw authenticatorAlreadyEnabledError();
  const enrollment = createTotpEnrollment(account.emailNormalized);
  const factorId = randomUUID();
  const encryptedSecret = encryptSecret(enrollment.secret, dependencies.config.encryptionKey);
  const saved = await dependencies.repository.saveMfaEnrollment(userId, Buffer.from(encryptedSecret), factorId);
  if (!saved) throw authenticatorAlreadyEnabledError();
  return {
    enrollmentRequired: true as const,
    secret: enrollment.secret,
    authenticatorUri: enrollment.uri,
    challengeExpiresInMinutes: input.challengeToken ? AUTH_LOGIN_CHALLENGE_MINUTES : null
  };
}
