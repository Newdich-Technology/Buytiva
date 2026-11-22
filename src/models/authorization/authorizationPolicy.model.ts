import { Permission } from '../../enums/permission.enum.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { UserStatus } from '../../enums/userStatus.enum.js';

export interface AuthorizationPrincipal {
  readonly assignedRoles: readonly UserRole[];
  readonly emailVerified: boolean;
  readonly mfaVerified: boolean;
  readonly status: UserStatus;
}

const customerPermissions = new Set([
  Permission.ORDER_CREATE,
  Permission.ORDER_READ_OWN
]);

const procurerPermissions = new Set([
  Permission.ORDER_READ_ASSIGNED,
  Permission.ORDER_UPDATE_ASSIGNED,
  Permission.PROCURER_PROFILE_UPDATE,
  Permission.PROCURER_AREA_MANAGE,
  Permission.PROCURER_PRICING_MANAGE,
  Permission.GOODS_FUNDING_REQUEST,
  Permission.EARNINGS_WITHDRAWAL_REQUEST
]);

const adminPermissions = new Set([
  Permission.APPLICATION_REVIEW,
  Permission.ORDER_READ_ASSIGNED,
  Permission.SUPPORT_CONVERSATION_ACCESS,
  Permission.MODERATION_REVIEW,
  Permission.FINANCIAL_REVIEW,
  Permission.AUDIT_READ
]);

const superAdminPermissions = new Set([
  ...adminPermissions,
  Permission.PLATFORM_POLICY_UPDATE,
  Permission.ADMINISTRATOR_MANAGE,
  Permission.FINANCIAL_OVERRIDE
]);

const rolePermissions: Readonly<Record<UserRole, ReadonlySet<Permission>>> = {
  [UserRole.CUSTOMER]: customerPermissions,
  [UserRole.PROCURER]: procurerPermissions,
  [UserRole.ADMIN]: adminPermissions,
  [UserRole.SUPER_ADMIN]: superAdminPermissions
};

const elevatedRoles = new Set([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

export function principalHasPermission(
  principal: AuthorizationPrincipal,
  permission: Permission
): boolean {
  if (principal.status !== UserStatus.ACTIVE || !principal.emailVerified) {
    return false;
  }

  for (const role of principal.assignedRoles) {
    if (elevatedRoles.has(role) && !principal.mfaVerified) continue;
    if (rolePermissions[role].has(permission)) return true;
  }

  return false;
}

export function canRevokeSuperAdminRole(activeSuperAdminCount: number): boolean {
  return Number.isInteger(activeSuperAdminCount) && activeSuperAdminCount > 1;
}
