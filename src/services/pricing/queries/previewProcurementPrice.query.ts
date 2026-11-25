import type { AddressRepository } from '../../../interfaces/addresses/addressRepository.interface.js';
import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { getAddressQuery } from '../../addresses/queries/getAddress.query.js';
import { getShoppingListQuery } from '../../shoppingLists/queries/getShoppingList.query.js';
import { calculatePricingQuery } from './calculatePricing.query.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';

export async function previewProcurementPriceQuery(repos: { addresses: AddressRepository; lists: ShoppingListRepository; procurers: ProcurerServicesRepository },
  owner: string, input: { addressId: string; listId: string; procurerId: string }) {
  const [address, list] = await Promise.all([getAddressQuery(repos.addresses, owner, input.addressId), getShoppingListQuery(repos.lists, owner, input.listId)]);
  const current = await repos.procurers.findPricingForLocation(input.procurerId, address);
  if (!current) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Procurer unavailable for this address.');
  try {
    const calculation = calculatePricingQuery(list.items.map((item) => ({ currency: list.currency, unitPriceMinor: item.expectedUnitPriceMinor, quantity: item.quantity })),
      { version: current.pricing.id, currency: current.pricing.currency, fixedFeeMinor: current.pricing.fixedFeeMinor, thresholdMinor: current.pricing.thresholdMinor,
        percentageBasisPoints: current.pricing.percentageBasisPoints, deliveryFeeMinor: current.zone.deliveryFeeMinor, commissionBasisPoints: 0 });
    return { currency: current.pricing.currency, policyId: current.pricing.id, policyVersion: current.pricing.version,
      subtotalMinor: calculation.subtotalMinor, serviceFeeMinor: calculation.serviceFeeMinor, deliveryFeeMinor: calculation.deliveryFeeMinor,
      customerTotalMinor: calculation.customerTotalMinor, binding: false as const };
  } catch (error) {
    if (error instanceof RangeError) throw new AppError(ErrorCode.VALIDATION, 400, 'Cannot calculate this shopping list.');
    throw error;
  }
}
