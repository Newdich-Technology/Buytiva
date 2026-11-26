import { describe, expect, it } from 'vitest';
import { normalizeLocation, validateProfile, validateZone } from '../../../src/validators/procurerServices/procurerServices.validator.js';

describe('procurer services validation', () => {
  it('normalizes locations without substring matching', () => {
    expect(normalizeLocation('  WUSE   2 ')).toBe('wuse 2');
    expect(normalizeLocation('Wuse')).not.toBe(normalizeLocation('Wuse 2'));
    expect(() => normalizeLocation('  ')).toThrow();
  });
  it('rejects invalid profiles and unsafe monetary values', () => {
    expect(() => validateProfile({ publicName: '  ', biography: null, acceptingRequests: true })).toThrow();
    const zone = { country: 'NG', region: 'FCT', city: 'Abuja', area: 'Wuse', currency: 'NGN' as const, deliveryFeeMinor: '10', active: true };
    expect(validateZone(zone)).toMatchObject({ country: 'NG', region: 'fct' });
    expect(() => validateZone({ ...zone, deliveryFeeMinor: '-1' })).toThrow();
    expect(() => validateZone({ ...zone, deliveryFeeMinor: '1.5' })).toThrow();
  });
});

it('validates versioned pricing without accepting negative values or invalid percentages', async () => {
  const { validatePricing } = await import('../../../src/validators/procurerServices/procurerServices.validator.js');
  const policy = { currency: 'NGN' as const, fixedFeeMinor: '300000', thresholdMinor: '4000000', percentageBasisPoints: 750, expectedVersion: 0 };
  expect(validatePricing(policy)).toEqual(policy);
  expect(() => validatePricing({ ...policy, percentageBasisPoints: 10001 })).toThrow();
  expect(() => validatePricing({ ...policy, fixedFeeMinor: '-1' })).toThrow();
  expect(() => validatePricing({ ...policy, thresholdMinor: '1.5' })).toThrow();
  expect(() => validatePricing({ ...policy, expectedVersion: -1 })).toThrow();
});
