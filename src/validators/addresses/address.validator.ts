import type { AddressInput } from '../../models/addresses/address.model.js';
import { invalidInputError } from '../../errors/auths/auth.error.js';
import { normalizeLocation } from '../procurerServices/procurerServices.validator.js';
function text(value: string, max: number): string {
  const result = value.normalize('NFKC').trim();
  if (!result || result.length > max || /[\p{C}]/u.test(result)) throw invalidInputError('Invalid address.');
  return result;
}
export function validateAddress(input: AddressInput): AddressInput {
  const country = input.country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw invalidInputError('Invalid address country.');
  return { label: text(input.label, 80), line1: text(input.line1, 200), line2: input.line2?.trim() ? text(input.line2, 200) : null,
    country, region: normalizeLocation(input.region), city: normalizeLocation(input.city), area: normalizeLocation(input.area) };
}
