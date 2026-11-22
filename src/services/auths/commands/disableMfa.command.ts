import { UserRole } from '../../../enums/userRole.enum.js';
import { invalidCredentialsError, invalidChallengeError, privilegedMfaRequiredError } from '../../../errors/auths/auth.error.js';
import { verifyTotpCode } from '../../../lib/security/mfaTotp.js';
import { decryptSecret } from '../../../lib/security/secretBox.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function disableMfaCommand(
  dependencies: AuthDependencies,
  userId: string,
  input: { password: string; code: string }
) {
  const [account, factor] = await Promise.all([
    dependencies.repository.findAccountById(userId),
    dependencies.repository.getMfaFactor(userId)
  ]);
  if (!account?.passwordHash || !(await dependencies.passwordHasher.verifyPassword(account.passwordHash, input.password))) {
    throw invalidCredentialsError();
  }
  if (account.roles.some((role) => role !== UserRole.CUSTOMER)) {
    throw privilegedMfaRequiredError();
  }
  if (!factor?.enabledAt) throw invalidChallengeError();
  const secret = decryptSecret(Buffer.from(factor.secretCiphertext).toString('utf8'), dependencies.config.encryptionKey);
  const step = verifyTotpCode(account.emailNormalized, secret, input.code);
  if (step === null || !(await dependencies.repository.acceptTotpStep(userId, factor.id, factor.lastAcceptedTimeStep, BigInt(step), new Date()))) {
    throw invalidChallengeError();
  }
  await dependencies.repository.disableMfa(userId, factor.id);
  await dependencies.repository.revokeAllSessions(userId, 'MFA_DISABLED', new Date());
  return { mfaDisabled: true as const, signInAgain: true as const };
}
