import { describe, expect, it } from 'vitest';
import { isRoleAccessSuspended } from '../../../src/utils/auths/accountAvailability.js';

describe('multi-role availability', () => {
  it('denies a suspended staff-only or procurer-only account while preserving customer access', () => {
    expect(isRoleAccessSuspended({ roles: ['ADMIN'], staffStatus: 'SUSPENDED', procurerStatus: null })).toBe(true);
    expect(isRoleAccessSuspended({ roles: ['PROCURER'], staffStatus: null, procurerStatus: 'SUSPENDED' })).toBe(true);
    expect(isRoleAccessSuspended({ roles: ['CUSTOMER', 'ADMIN'], staffStatus: 'SUSPENDED', procurerStatus: null })).toBe(false);
    expect(isRoleAccessSuspended({ roles: ['ADMIN'], staffStatus: 'ACTIVE', procurerStatus: null })).toBe(false);
  });
});
