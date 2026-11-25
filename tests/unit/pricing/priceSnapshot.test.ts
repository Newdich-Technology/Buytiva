import { expect, it } from 'vitest';
import { calculatePricingQuery } from '../../../src/services/pricing/queries/calculatePricing.query.js';

it('copies and freezes the calculation inputs and result', () => {
  const policy = { version: 'v1', currency: 'NGN', fixedFeeMinor: '10', thresholdMinor: '100', percentageBasisPoints: 1000, commissionBasisPoints: 1000, deliveryFeeMinor: '5' };
  const line = { currency: 'NGN', unitPriceMinor: '50', quantity: '1' };
  const snapshot = calculatePricingQuery([line], policy);
  policy.fixedFeeMinor = '99';
  line.unitPriceMinor = '99';
  expect(snapshot.policy.fixedFeeMinor).toBe('10');
  expect(snapshot.lines[0]?.unitPriceMinor).toBe('50');
  expect(Object.isFrozen(snapshot)).toBe(true);
  expect(Object.isFrozen(snapshot.policy)).toBe(true);
  expect(Object.isFrozen(snapshot.lines[0])).toBe(true);
});
