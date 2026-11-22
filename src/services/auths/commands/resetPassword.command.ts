import { invalidChallengeError, invalidInputError, passwordPolicyError } from '../../../errors/auths/auth.error.js';
import { AUTH_ERROR_MESSAGES } from '../../../constants/auths/auth.constants.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { validatePasswordStrength } from '../../../validators/auths/password.validator.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function resetPasswordCommand(
  dependencies: AuthDependencies,
  input: { token: string; password: string; confirmPassword: string }
) {
  if (input.password !== input.confirmPassword) throw invalidInputError(AUTH_ERROR_MESSAGES.passwordConfirmationMismatch);
  try {
    validatePasswordStrength(input.password, dependencies.config.passwordMinLength, dependencies.config.passwordMaxLength);
  } catch {
    throw passwordPolicyError();
  }
  const changed = await dependencies.repository.resetPassword(
    hashOneTimeToken(input.token),
    await dependencies.passwordHasher.hashPassword(input.password),
    new Date()
  );
  if (!changed) throw invalidChallengeError();
  return { passwordReset: true as const };
}
