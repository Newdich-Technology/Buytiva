import type { AuthDependencies } from '../../types/authDependencies.type.js';
import { inviteStaffCommand } from '../../services/administrators/commands/inviteStaff.command.js';
import { updateStaffPermissionsCommand } from '../../services/administrators/commands/updateStaffPermissions.command.js';
import { reactivateStaffCommand } from '../../services/administrators/commands/reactivateStaff.command.js';
import { suspendStaffCommand } from '../../services/administrators/commands/suspendStaff.command.js';
import { revokeStaffCommand } from '../../services/administrators/commands/revokeStaff.command.js';
import { listStaffAuditLogsQuery, listStaffQuery, getStaffPermissionCatalogQuery } from '../../services/administrators/queries/listStaff.query.js';

export class StaffController {
  constructor(private readonly dependencies: AuthDependencies) {}

  inviteAdministrator(input: Omit<Parameters<typeof inviteStaffCommand>[1], 'role'>) {
    return inviteStaffCommand(this.dependencies, { ...input, role: 'ADMIN' });
  }

  inviteSuperAdministrator(input: Omit<Parameters<typeof inviteStaffCommand>[1], 'role'>) {
    return inviteStaffCommand(this.dependencies, { ...input, role: 'SUPER_ADMIN' });
  }

  listStaff() {
    return listStaffQuery(this.dependencies);
  }

  permissionCatalog() {
    return getStaffPermissionCatalogQuery();
  }

  listAuditLogs() {
    return listStaffAuditLogsQuery(this.dependencies);
  }

  updatePermissions(input: Parameters<typeof updateStaffPermissionsCommand>[1]) {
    return updateStaffPermissionsCommand(this.dependencies, input);
  }

  reactivate(input: Parameters<typeof reactivateStaffCommand>[1]) {
    return reactivateStaffCommand(this.dependencies, input);
  }

  suspend(input: Parameters<typeof suspendStaffCommand>[1]) {
    return suspendStaffCommand(this.dependencies, input);
  }

  revoke(input: Parameters<typeof revokeStaffCommand>[1]) {
    return revokeStaffCommand(this.dependencies, input);
  }
}
