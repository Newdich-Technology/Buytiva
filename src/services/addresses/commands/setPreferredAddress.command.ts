import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function setPreferredAddressCommand(repo: AddressRepository, owner: string, id: string) {
  const address = await repo.setPreferred(owner, id);
  if (!address) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Address not found.');
  return address;
}
