import { AUTH_ERROR_MESSAGES, AUTH_REVIEW_REASON_MAX, AUTH_REVIEW_REASON_MIN } from '../../../constants/auths/auth.constants.js';
import { invalidInputError, staffAccessConflictError } from '../../../errors/auths/auth.error.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function reactivateStaffCommand(dependencies: AuthDependencies, input: { userId: string; actorId: string; reason: string }) {
  const reason = input.reason.trim();
  if (reason.length < AUTH_REVIEW_REASON_MIN || reason.length > AUTH_REVIEW_REASON_MAX) throw invalidInputError(AUTH_ERROR_MESSAGES.reasonRequired);
  if (input.actorId === input.userId) throw staffAccessConflictError();
  if (!await dependencies.staffRepository.reactivateStaff({ ...input, reason, now: new Date() })) throw staffAccessConflictError();
  return { reactivated: true as const, signInAgain: true as const };
}
