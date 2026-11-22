import type { AuthPrincipal } from '../../../models/auths/auth.model.js';

export function getCurrentUserQuery(principal: AuthPrincipal) {
  return {
    id: principal.userId,
    email: principal.email,
    displayName: principal.displayName,
    roles: principal.roles,
    permissions: principal.permissions,
    emailVerifiedAt: principal.emailVerifiedAt,
    accountStatus: principal.userStatus,
    mustChangePassword: principal.mustChangePassword,
    procurerStatus: principal.procurerStatus,
    staffStatus: principal.staffStatus
  };
}
