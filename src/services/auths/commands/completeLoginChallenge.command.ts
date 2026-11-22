import { AUTH_OTP_MAX_ATTEMPTS } from '../../../constants/auths/auth.constants.js';
import { invalidChallengeError } from '../../../errors/auths/auth.error.js';
import { decryptSecret } from '../../../lib/security/secretBox.js';
import { verifyTotpCode } from '../../../lib/security/mfaTotp.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { issueAuthenticatedSession } from '../../../lib/security/sessionIssuer.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function completeLoginChallengeCommand(
  dependencies: AuthDependencies,
  input: { challengeToken: string; code: string; deviceLabel?: string }
) {
  const now = new Date();
  const challenge = await dependencies.repository.findLoginChallenge(hashOneTimeToken(input.challengeToken));
  if (!challenge || challenge.purpose !== 'LOGIN_MFA' || challenge.consumedAt || challenge.expiresAt <= now || challenge.attempts >= AUTH_OTP_MAX_ATTEMPTS) {
    throw invalidChallengeError();
  }
  const account = await dependencies.repository.findAccountById(challenge.userId);
  const factor = await dependencies.repository.getMfaFactor(challenge.userId);
  if (!account || !factor?.enabledAt) throw invalidChallengeError();
  const secret = decryptSecret(Buffer.from(factor.secretCiphertext).toString('utf8'), dependencies.config.encryptionKey);
  const timeStep = verifyTotpCode(account.emailNormalized, secret, input.code);
  if (timeStep === null) {
    await dependencies.repository.incrementLoginAttempt(challenge.id, challenge.attempts, now);
    throw invalidChallengeError();
  }
  const completed = await dependencies.repository.completeLoginChallenge(
    challenge.id,
    account.id,
    challenge.attempts,
    BigInt(timeStep),
    now
  );
  if (!completed) throw invalidChallengeError();
  return issueAuthenticatedSession(dependencies.repository, dependencies.config, account, now, input.deviceLabel ?? null);
}
