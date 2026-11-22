import { AUTH_ERROR_MESSAGES, AUTH_REVIEW_REASON_MAX, AUTH_REVIEW_REASON_MIN } from '../../../constants/auths/auth.constants.js';
import { STAFF_PERMISSION_CODES } from '../../../constants/administration/permission.constants.js';
import { invalidInputError, staffAccessConflictError } from '../../../errors/auths/auth.error.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function updateStaffPermissionsCommand(dependencies: AuthDependencies, input: { userId: string; actorId: string; permissionCodes: readonly string[]; reason: string }) {
  const codes = [...new Set(input.permissionCodes)];
  if (codes.length !== input.permissionCodes.length || codes.some((code) => !STAFF_PERMISSION_CODES.includes(code as (typeof STAFF_PERMISSION_CODES)[number]))) throw invalidInputError(AUTH_ERROR_MESSAGES.staffPermissionInvalid);
  if (input.reason.trim().length < AUTH_REVIEW_REASON_MIN || input.reason.length > AUTH_REVIEW_REASON_MAX) throw invalidInputError(AUTH_ERROR_MESSAGES.reasonRequired);
  if (!(await dependencies.staffRepository.updateStaffPermissions({ ...input, permissionCodes: codes, reason: input.reason.trim(), now: new Date() }))) throw staffAccessConflictError();
  return { updated: true as const };
}
