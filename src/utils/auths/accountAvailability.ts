import { UserRole } from '../../enums/userRole.enum.js';

/** Preserve customer access for multi-role accounts while denying suspended staff-only or procurer-only accounts. */
export function isRoleAccessSuspended(account: { roles: readonly string[]; staffStatus: string | null; procurerStatus: string | null }): boolean {
  if (account.roles.includes(UserRole.CUSTOMER)) return false;
  return (account.roles.includes(UserRole.PROCURER) && account.procurerStatus === 'SUSPENDED') ||
    ((account.roles.includes(UserRole.ADMIN) || account.roles.includes(UserRole.SUPER_ADMIN)) && account.staffStatus === 'SUSPENDED');
}
