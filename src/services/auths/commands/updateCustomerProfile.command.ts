import type { AuthRepository } from '../../../interfaces/auths/authRepository.interface.js';
import { invalidInputError, permissionDeniedError } from '../../../errors/auths/auth.error.js';

export async function updateCustomerProfileCommand(repository: AuthRepository, userId: string, displayName: string) {
  const name = displayName.normalize('NFKC').trim();
  if (name.length < 2 || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name)) throw invalidInputError('Invalid display name.');
  if (!await repository.updateCustomerDisplayName(userId, name)) throw permissionDeniedError();
  return { displayName: name };
}
