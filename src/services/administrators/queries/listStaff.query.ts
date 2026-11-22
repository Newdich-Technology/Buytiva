import { STAFF_PERMISSION_CODES, STAFF_PERMISSION_PROFILES } from '../../../constants/administration/permission.constants.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function listStaffQuery(dependencies: AuthDependencies) {
  return dependencies.staffRepository.listStaff();
}

export async function listStaffAuditLogsQuery(dependencies: AuthDependencies) {
  return dependencies.staffRepository.listAuditLogs();
}

export function getStaffPermissionCatalogQuery() {
  return {
    codes: [...STAFF_PERMISSION_CODES],
    profiles: Object.fromEntries(Object.entries(STAFF_PERMISSION_PROFILES).map(([name, permissions]) => [name, [...permissions]]))
  };
}
