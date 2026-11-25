import type { ItemInput, ListInput, StoredItemInput } from '../../models/shoppingLists/shoppingList.model.js';
import { invalidInputError } from '../../errors/auths/auth.error.js';

function text(value: string, max: number): string {
  const result = value.trim();
  if (!result || result.length > max) throw invalidInputError('Invalid shopping list text.');
  return result;
}
function optionalText(value: string | null | undefined, max: number): string | null {
  if (value == null || !value.trim()) return null;
  return text(value, max);
}
export function validateList(input: ListInput): ListInput {
  if (input.currency !== 'NGN') throw invalidInputError('Unsupported currency.');
  return { title: text(input.title, 120), currency: input.currency, notes: optionalText(input.notes, 2000) };
}
export function validateItem(input: ItemInput): StoredItemInput {
  if (!/^(0|[1-9]\d{0,5})(\.\d{1,3})?$/.test(input.quantity)) throw invalidInputError('Invalid quantity.');
  const [whole, fraction = ''] = input.quantity.split('.');
  const quantityMilli = Number(whole) * 1000 + Number(fraction.padEnd(3, '0'));
  if (quantityMilli <= 0) throw invalidInputError('Quantity must be positive.');
  if (!/^(0|[1-9]\d{0,17})$/.test(input.expectedUnitPriceMinor)) throw invalidInputError('Invalid expected unit price.');
  return { name: text(input.name, 160), quantityMilli, expectedUnitPriceMinor: BigInt(input.expectedUnitPriceMinor), notes: optionalText(input.notes, 1000) };
}
