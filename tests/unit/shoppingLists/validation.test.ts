import { describe, expect, it } from 'vitest';
import { validateItem, validateList } from '../../../src/validators/shoppingLists/shoppingList.validator.js';

describe('shopping list input validation', () => {
  it('preserves exact prices and fractional quantities', () => {
    expect(validateItem({ name: ' Rice ', quantity: '1.125', expectedUnitPriceMinor: '9007199254740993' })).toEqual({ name: 'Rice', quantityMilli: 1125, expectedUnitPriceMinor: 9007199254740993n, notes: null });
  });
  it.each(['0', '-1', '1.0001', '1e3', '1000000', 'NaN'])('rejects invalid quantity %s', (quantity) => {
    expect(() => validateItem({ name: 'Rice', quantity, expectedUnitPriceMinor: '1' })).toThrow();
  });
  it.each(['-1', '1.0', '1e9', '9999999999999999999'])('rejects invalid minor-unit price %s', (price) => {
    expect(() => validateItem({ name: 'Rice', quantity: '1', expectedUnitPriceMinor: price })).toThrow();
  });
  it('accepts a zero expected price and rejects blank titles', () => {
    expect(validateItem({ name: 'Tea', quantity: '0.001', expectedUnitPriceMinor: '0' }).expectedUnitPriceMinor).toBe(0n);
    expect(() => validateList({ title: '   ', currency: 'NGN' })).toThrow();
  });
});
