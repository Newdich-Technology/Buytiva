import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
export function listAddressesQuery(repo: AddressRepository, ownerId: string, offset: number, limit: number) { return repo.list(ownerId, offset, limit); }
