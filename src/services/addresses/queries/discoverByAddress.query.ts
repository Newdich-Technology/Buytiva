import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { getAddressQuery } from './getAddress.query.js';
import { discoverProcurersQuery } from '../../procurerServices/queries/discoverProcurers.query.js';
export async function discoverByAddressQuery(addresses: AddressRepository, procurers: ProcurerServicesRepository, owner: string, id: string, offset: number, limit: number) {
  const { country, region, city, area } = await getAddressQuery(addresses, owner, id);
  return discoverProcurersQuery(procurers, { country, region, city, area, offset, limit });
}
