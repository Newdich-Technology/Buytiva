import { describe, expect, it } from 'vitest';
import { getCommissionPolicy } from '../../../src/configs/quotations/commission.config.js';
describe('quotation commission configuration', () => {
  it('requires an explicit valid policy instead of assuming a default', () => {
    expect(() => getCommissionPolicy({})).toThrow();
    expect(() => getCommissionPolicy({ PLATFORM_COMMISSION_POLICY_VERSION: 'v1', PLATFORM_COMMISSION_BASIS_POINTS: '10001' })).toThrow();
    expect(() => getCommissionPolicy({ PLATFORM_COMMISSION_POLICY_VERSION: 'v1', PLATFORM_COMMISSION_BASIS_POINTS: '-1' })).toThrow();
    expect(getCommissionPolicy({ PLATFORM_COMMISSION_POLICY_VERSION: 'v1', PLATFORM_COMMISSION_BASIS_POINTS: '1000' })).toEqual({ version: 'v1', basisPoints: 1000 });
  });
});
