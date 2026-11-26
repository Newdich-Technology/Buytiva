import { describe, expect, it } from 'vitest';
import { normalizeDisplayName } from '../../../src/validators/auths/displayName.validator.js';
describe('customer display-name policy', () => {
  it('normalizes and trims consistently for registration and profile edits', () => {
    expect(normalizeDisplayName('  Ａda  ')).toBe('Ada');
    expect(normalizeDisplayName('A')).toBeNull();
    expect(normalizeDisplayName('Ada\u0000B')).toBeNull();
    expect(normalizeDisplayName('A'.repeat(121))).toBeNull();
  });
});
