import { normalizeDisplayName } from '../../../validators/auths/displayName.validator.js';
import type { AuthRepository } from '../../../interfaces/auths/authRepository.interface.js';
import { invalidInputError, permissionDeniedError } from '../../../errors/auths/auth.error.js';

export async function updateCustomerProfileCommand(repository: AuthRepository, userId: string, displayName: string) {
  const name = normalizeDisplayName(displayName);
  if (!name) throw invalidInputError('Invalid display name.');
  if (!await repository.updateCustomerDisplayName(userId, name)) throw permissionDeniedError();
  return { displayName: name };
}
