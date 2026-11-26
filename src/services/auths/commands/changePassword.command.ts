import { invalidCredentialsError, invalidInputError, passwordPolicyError } from '../../../errors/auths/auth.error.js';
import { AUTH_ERROR_MESSAGES } from '../../../constants/auths/auth.constants.js';
import { validatePasswordStrength } from '../../../validators/auths/password.validator.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function changePasswordCommand(
  dependencies: AuthDependencies,
  userId: string,
  input: { currentPassword: string; password: string; confirmPassword: string }
) {
  if (input.password !== input.confirmPassword || input.password === input.currentPassword) {
    throw invalidInputError(AUTH_ERROR_MESSAGES.passwordChangeMismatch);
  }
  const account = await dependencies.repository.findAccountById(userId);
  if (!account?.passwordHash || !(await dependencies.passwordHasher.verifyPassword(account.passwordHash, input.currentPassword))) {
    throw invalidCredentialsError();
  }
  try {
    validatePasswordStrength(input.password, dependencies.config.passwordMinLength, dependencies.config.passwordMaxLength);
  } catch {
    throw passwordPolicyError();
  }
  const changed = await dependencies.repository.changePassword(
    userId,
    account.passwordHash,
    await dependencies.passwordHasher.hashPassword(input.password),
    new Date()
  );
  if (!changed) throw invalidCredentialsError();
  return { passwordChanged: true as const, signInAgain: true as const };
}
