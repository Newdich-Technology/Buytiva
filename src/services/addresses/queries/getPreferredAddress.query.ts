import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
export function getPreferredAddressQuery(repo: AddressRepository, owner: string) { return repo.getPreferred(owner); }
