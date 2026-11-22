import { AUTH_ERROR_MESSAGES, AUTH_REVIEW_REASON_MAX, AUTH_REVIEW_REASON_MIN } from '../../../constants/auths/auth.constants.js';
import { invalidInputError, staffAccessConflictError } from '../../../errors/auths/auth.error.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function suspendStaffCommand(dependencies: AuthDependencies, input: { userId: string; actorId: string; reason: string }) {
  if (input.reason.trim().length < AUTH_REVIEW_REASON_MIN || input.reason.length > AUTH_REVIEW_REASON_MAX) throw invalidInputError(AUTH_ERROR_MESSAGES.reasonRequired);
  if (!(await dependencies.staffRepository.suspendStaff({ ...input, reason: input.reason.trim(), now: new Date() }))) throw staffAccessConflictError(AUTH_ERROR_MESSAGES.superAdminLastActive);
  return { suspended: true as const };
}
