import { describe, expect, it } from 'vitest';
import { validateAddress } from '../../../src/validators/addresses/address.validator.js';
const sample = { label: ' Home ', line1: ' 23 Example St ', line2: null, country: 'ng', region: ' FCT ', city: 'ABUJA', area: 'Wuse 2' };
describe('address validation', () => {
  it('normalizes locations for exact matching and retains street text', () => {
    expect(validateAddress(sample)).toMatchObject({ label: 'Home', line1: '23 Example St', country: 'NG', region: 'fct', city: 'abuja', area: 'wuse 2' });
  });
  it('rejects blank and control character fields', () => {
    expect(() => validateAddress({ ...sample, line1: ' ' })).toThrow();
    expect(() => validateAddress({ ...sample, area: 'Wuse\u0000' })).toThrow();
    expect(() => validateAddress({ ...sample, country: 'N1' })).toThrow();
  });
});
