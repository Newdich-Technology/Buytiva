import type { AddressRepository } from '../../interfaces/addresses/addressRepository.interface.js';
import type { ShoppingListRepository } from '../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { previewProcurementPriceQuery } from '../../services/pricing/queries/previewProcurementPrice.query.js';
export class PricingPreviewController {
  constructor(private readonly repositories: { addresses: AddressRepository; lists: ShoppingListRepository; procurers: ProcurerServicesRepository }) {}
  preview(owner: string, input: { addressId: string; listId: string; procurerId: string }) { return previewProcurementPriceQuery(this.repositories, owner, input); }
}
