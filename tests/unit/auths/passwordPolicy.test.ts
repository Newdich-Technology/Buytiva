import { describe, expect, it } from 'vitest';
import { validatePasswordStrength } from '../../../src/validators/auths/password.validator.js';

describe('password policy', () => {
  it('accepts a password with sufficient length and character groups', () => {
    expect(() => validatePasswordStrength('LongEnough42!', 12, 128)).not.toThrow();
  });
  it.each(['short1!', 'abcdefghijklm', 'PASSWORDPASSWORD', 'x'.repeat(129)])('rejects weak or out-of-range passwords', (password) => {
    expect(() => validatePasswordStrength(password, 12, 128)).toThrow();
  });
});
