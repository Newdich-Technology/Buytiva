import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
import type { AddressInput } from '../../../models/addresses/address.model.js';
import { validateAddress } from '../../../validators/addresses/address.validator.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function saveAddressCommand(repo: AddressRepository, ownerId: string, input: AddressInput, id?: string) {
  const validated = validateAddress(input);
  const result = id ? await repo.update(ownerId, id, validated) : await repo.create(ownerId, validated);
  if (!result) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Address not found.');
  return result;
}
