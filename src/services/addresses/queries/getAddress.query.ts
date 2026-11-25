import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function getAddressQuery(repo: AddressRepository, ownerId: string, id: string) {
  const address = await repo.get(ownerId, id);
  if (!address) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Address not found.');
  return address;
}
