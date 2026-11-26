import type { AddressRepository } from '../../interfaces/addresses/addressRepository.interface.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { AddressInput } from '../../models/addresses/address.model.js';
import { setPreferredAddressCommand } from '../../services/addresses/commands/setPreferredAddress.command.js';
import { getPreferredAddressQuery } from '../../services/addresses/queries/getPreferredAddress.query.js';
import { saveAddressCommand } from '../../services/addresses/commands/saveAddress.command.js';
import { deleteAddressCommand } from '../../services/addresses/commands/deleteAddress.command.js';
import { getAddressQuery } from '../../services/addresses/queries/getAddress.query.js';
import { listAddressesQuery } from '../../services/addresses/queries/listAddresses.query.js';
import { discoverByAddressQuery } from '../../services/addresses/queries/discoverByAddress.query.js';
export class AddressController {
  constructor(private readonly addresses: AddressRepository, private readonly procurers: ProcurerServicesRepository) {}
  getPreferred(owner: string) { return getPreferredAddressQuery(this.addresses, owner); }
  setPreferred(owner: string, id: string) { return setPreferredAddressCommand(this.addresses, owner, id); }
  get(owner: string, id: string) { return getAddressQuery(this.addresses, owner, id); }
  list(owner: string, offset: number, limit: number) { return listAddressesQuery(this.addresses, owner, offset, limit); }
  save(owner: string, input: AddressInput, id?: string) { return saveAddressCommand(this.addresses, owner, input, id); }
  delete(owner: string, id: string) { return deleteAddressCommand(this.addresses, owner, id); }
  discover(owner: string, id: string, offset: number, limit: number) { return discoverByAddressQuery(this.addresses, this.procurers, owner, id, offset, limit); }
}
