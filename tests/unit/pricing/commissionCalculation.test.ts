import { describe, expect, it } from 'vitest';
import { calculatePricingQuery } from '../../../src/services/pricing/queries/calculatePricing.query.js';
import type { PricingPolicy } from '../../../src/models/pricing/pricing.model.js';

const policy: PricingPolicy = { version: 'v1', currency: 'NGN', fixedFeeMinor: '250', thresholdMinor: '10000', percentageBasisPoints: 500, commissionBasisPoints: 2000, deliveryFeeMinor: '100' };
const item = (unitPriceMinor: string, quantity = '1', currency = 'NGN') => ({ unitPriceMinor, quantity, currency });

describe('pricing calculation', () => {
  it('uses fixed fee through the threshold and percentage of the whole subtotal above it', () => {
    expect(calculatePricingQuery([item('9999')], policy).serviceFeeMinor).toBe('250');
    expect(calculatePricingQuery([item('10000')], policy).serviceFeeMinor).toBe('250');
    expect(calculatePricingQuery([item('10001')], policy).serviceFeeMinor).toBe('500');
  });
  it('deducts commission from service fee, not the customer total', () => {
    expect(calculatePricingQuery([item('20000')], policy)).toMatchObject({ subtotalMinor: '20000', serviceFeeMinor: '1000', platformCommissionMinor: '200', procurerServiceEarningsMinor: '800', customerTotalMinor: '21100' });
  });
  it('rounds fractional lines and percentage fees half up', () => {
    expect(calculatePricingQuery([item('101', '0.5'), item('2', '1.25')], { ...policy, thresholdMinor: '0', percentageBasisPoints: 1000, commissionBasisPoints: 1000 })).toMatchObject({ subtotalMinor: '54', serviceFeeMinor: '5', platformCommissionMinor: '1', procurerServiceEarningsMinor: '4' });
  });
  it('permits zero-value items but requires positive quantity', () => {
    expect(calculatePricingQuery([item('0')], policy).subtotalMinor).toBe('0');
    expect(() => calculatePricingQuery([item('0', '0')], policy)).toThrow();
  });
  it.each(['-1', '1.1', '01', '1e4', '9999999999999999999'])('rejects invalid price %s', (price) => {
    expect(() => calculatePricingQuery([item(price)], policy)).toThrow();
  });
  it.each(['-1', '0', '0.000', '1.0001', 'NaN', '1e3'])('rejects invalid quantity %s', (value) => {
    expect(() => calculatePricingQuery([item('1', value)], policy)).toThrow();
  });
  it('rejects unsupported amounts, rates and currencies', () => {
    expect(() => calculatePricingQuery([item('999999999999999999', '2')], policy)).toThrow();
    expect(() => calculatePricingQuery([item('1', '1', 'USD')], policy)).toThrow();
    expect(() => calculatePricingQuery([item('1')], { ...policy, currency: 'ngn' })).toThrow();
    expect(() => calculatePricingQuery([item('1')], { ...policy, commissionBasisPoints: 10001 })).toThrow();
    expect(() => calculatePricingQuery([], policy)).toThrow();
  });
  it('computes large totals exactly without IEEE-754 loss', () => {
    const snapshot = calculatePricingQuery([item('9007199254740993')], { ...policy, percentageBasisPoints: 0, deliveryFeeMinor: '0' });
    expect(snapshot.customerTotalMinor).toBe('9007199254740993');
  });
});
