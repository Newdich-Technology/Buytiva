import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function deleteAddressCommand(repo: AddressRepository, ownerId: string, id: string) {
  if (!await repo.delete(ownerId, id)) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Address not found.');
  return { deleted: true as const };
}
