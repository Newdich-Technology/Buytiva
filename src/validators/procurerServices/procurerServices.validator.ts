import { invalidInputError } from '../../errors/auths/auth.error.js';
import type { ProfileInput, ZoneInput } from '../../models/procurerServices/procurerServices.model.js';

export function normalizeLocation(value: string): string {
  const normalized = value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('en');
  if (!normalized || normalized.length > 100 || /[\p{C}]/u.test(normalized)) throw invalidInputError('Invalid location.');
  return normalized;
}
export function validateProfile(input: ProfileInput): ProfileInput {
  const publicName = input.publicName.trim();
  const biography = input.biography?.trim() || null;
  if (publicName.length < 2 || publicName.length > 120 || (biography && biography.length > 2000)) throw invalidInputError('Invalid profile.');
  return { publicName, biography, acceptingRequests: input.acceptingRequests };
}
export function validateZone(input: ZoneInput): ZoneInput {
  const country = input.country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country) || input.currency !== 'NGN' || !/^(0|[1-9]\d{0,17})$/.test(input.deliveryFeeMinor)) throw invalidInputError('Invalid delivery zone.');
  return { ...input, country, region: normalizeLocation(input.region), city: normalizeLocation(input.city), area: normalizeLocation(input.area) };
}

export function validatePricing(input: import('../../models/procurerServices/procurerServices.model.js').PricingPolicyInput) {
  if (input.currency !== 'NGN' || !/^(0|[1-9]\d{0,17})$/.test(input.fixedFeeMinor) || !/^(0|[1-9]\d{0,17})$/.test(input.thresholdMinor) ||
    !Number.isInteger(input.percentageBasisPoints) || input.percentageBasisPoints < 0 || input.percentageBasisPoints > 10000 ||
    !Number.isInteger(input.expectedVersion) || input.expectedVersion < 0 || input.expectedVersion >= 2147483647) throw invalidInputError('Invalid pricing policy.');
  return { currency: input.currency, fixedFeeMinor: input.fixedFeeMinor, thresholdMinor: input.thresholdMinor,
    percentageBasisPoints: input.percentageBasisPoints, expectedVersion: input.expectedVersion };
}
