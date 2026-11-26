import { isRoleAccessSuspended } from '../../../utils/auths/accountAvailability.js';
import { UserStatus } from '../../../enums/userStatus.enum.js';
import { AUTH_OTP_MAX_ATTEMPTS } from '../../../constants/auths/auth.constants.js';
import { invalidChallengeError } from '../../../errors/auths/auth.error.js';
import { verifyTotpCode } from '../../../lib/security/mfaTotp.js';
import { decryptSecret } from '../../../lib/security/secretBox.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { issueAuthenticatedSession } from '../../../lib/security/sessionIssuer.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function verifyTotpEnrollmentCommand(
  dependencies: AuthDependencies,
  input: { code: string; userId?: string; challengeToken?: string; deviceLabel?: string }
) {
  let challengeId: string | undefined;
  let expectedAttempts: number | undefined;
  let userId = input.userId;
  if (input.challengeToken) {
    const challenge = await dependencies.repository.findLoginChallenge(hashOneTimeToken(input.challengeToken));
    if (!challenge || challenge.purpose !== 'MFA_ENROLLMENT' || challenge.consumedAt || challenge.expiresAt <= new Date() || challenge.attempts >= AUTH_OTP_MAX_ATTEMPTS) {
      throw invalidChallengeError();
    }
    challengeId = challenge.id;
    expectedAttempts = challenge.attempts;
    userId = challenge.userId;
  }
  if (!userId) throw invalidChallengeError();
  const [account, factor] = await Promise.all([
    dependencies.repository.findAccountById(userId),
    dependencies.repository.getMfaFactor(userId)
  ]);
  if (!account || account.status !== UserStatus.ACTIVE || !account.emailVerifiedAt || isRoleAccessSuspended(account) || !factor || factor.enabledAt) throw invalidChallengeError();
  const secret = decryptSecret(Buffer.from(factor.secretCiphertext).toString('utf8'), dependencies.config.encryptionKey);
  const timeStep = verifyTotpCode(account.emailNormalized, secret, input.code);
  if (timeStep === null) {
    if (challengeId && expectedAttempts !== undefined) {
      await dependencies.repository.incrementLoginAttempt(challengeId, expectedAttempts, new Date());
    }
    throw invalidChallengeError();
  }
  const now = new Date();
  const enabled = await dependencies.repository.completeMfaEnrollment(
    userId,
    factor.id,
    BigInt(timeStep),
    now,
    challengeId,
    expectedAttempts
  );
  if (!enabled) throw invalidChallengeError();
  if (!challengeId) return { mfaEnabled: true as const };
  const updatedAccount = await dependencies.repository.findAccountById(userId);
  if (!updatedAccount || updatedAccount.status !== UserStatus.ACTIVE || !updatedAccount.emailVerifiedAt || isRoleAccessSuspended(updatedAccount)) throw invalidChallengeError();
  return {
    mfaEnabled: true as const,
    session: await issueAuthenticatedSession(dependencies.repository, dependencies.config, account, now, input.deviceLabel ?? null)
  };
}
