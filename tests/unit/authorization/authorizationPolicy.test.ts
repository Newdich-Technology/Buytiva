import { describe, expect, it } from 'vitest';
import { Permission } from '../../../src/enums/permission.enum.js';
import { UserRole } from '../../../src/enums/userRole.enum.js';
import { UserStatus } from '../../../src/enums/userStatus.enum.js';
import {
  canRevokeSuperAdminRole,
  principalHasPermission,
  type AuthorizationPrincipal
} from '../../../src/models/authorization/authorizationPolicy.model.js';

function createPrincipal(
  assignedRoles: UserRole[],
  updates: Partial<AuthorizationPrincipal> = {}
): AuthorizationPrincipal {
  return {
    assignedRoles,
    emailVerified: true,
    mfaVerified: true,
    status: UserStatus.ACTIVE,
    ...updates
  };
}

describe('role authorization policy', () => {
  it('denies customer access to admin review permissions', () => {
    const principal = createPrincipal([UserRole.CUSTOMER]);

    expect(principalHasPermission(principal, Permission.APPLICATION_REVIEW)).toBe(false);
  });

  it('denies platform policy changes to a principal assigned only as a customer', () => {
    const principal = createPrincipal([UserRole.CUSTOMER]);

    expect(principalHasPermission(principal, Permission.PLATFORM_POLICY_UPDATE)).toBe(false);
  });

  it('allows an assigned procurer to manage pricing', () => {
    const principal = createPrincipal([UserRole.PROCURER]);

    expect(principalHasPermission(principal, Permission.PROCURER_PRICING_MANAGE)).toBe(true);
  });

  it('requires verified email and MFA for elevated roles', () => {
    const principal = createPrincipal([UserRole.ADMIN], { mfaVerified: false });

    expect(principalHasPermission(principal, Permission.APPLICATION_REVIEW)).toBe(false);
    expect(
      principalHasPermission(
        createPrincipal([UserRole.ADMIN], { emailVerified: false }),
        Permission.APPLICATION_REVIEW
      )
    ).toBe(false);
  });

  it('denies suspended users regardless of assigned roles', () => {
    const principal = createPrincipal([UserRole.SUPER_ADMIN], {
      status: UserStatus.SUSPENDED
    });

    expect(principalHasPermission(principal, Permission.PLATFORM_POLICY_UPDATE)).toBe(false);
  });

  it('prevents revoking the last active super-admin role', () => {
    expect(canRevokeSuperAdminRole(1)).toBe(false);
    expect(canRevokeSuperAdminRole(2)).toBe(true);
    expect(canRevokeSuperAdminRole(Number.NaN)).toBe(false);
  });
});
