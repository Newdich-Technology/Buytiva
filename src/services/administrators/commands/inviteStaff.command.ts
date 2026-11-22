import { randomUUID } from 'node:crypto';
import { AUTH_ERROR_MESSAGES, AUTH_HOUR_MS, AUTH_INVITATION_HOURS, AUTH_REVIEW_REASON_MAX, AUTH_REVIEW_REASON_MIN } from '../../../constants/auths/auth.constants.js';
import { STAFF_PERMISSION_CODES, STAFF_PERMISSION_PROFILES } from '../../../constants/administration/permission.constants.js';
import { invalidInputError } from '../../../errors/auths/auth.error.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createInvitationEmail } from '../../../lib/email/emailTemplates.js';
import { generateOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';
import type { StaffInvitationRole } from '../../../interfaces/administrators/staffInvitationRepository.interface.js';

export async function inviteStaffCommand(dependencies: AuthDependencies, input: { issuerId: string; email: string; displayName: string; role: StaffInvitationRole; reason: string; permissionProfile?: keyof typeof STAFF_PERMISSION_PROFILES; permissionCodes?: readonly string[] }) {
  const permissionCodes = input.role === 'ADMIN'
    ? [...(input.permissionProfile ? STAFF_PERMISSION_PROFILES[input.permissionProfile] : input.permissionCodes ?? [])]
    : [];
  if (input.role === 'ADMIN' && (permissionCodes.some((permission) => !STAFF_PERMISSION_CODES.includes(permission as (typeof STAFF_PERMISSION_CODES)[number])) || new Set(permissionCodes).size !== permissionCodes.length)) {
    throw invalidInputError(AUTH_ERROR_MESSAGES.staffPermissionInvalid);
  }
  if (input.displayName.trim().length < 2 || input.displayName.length > 120 || input.reason.trim().length < AUTH_REVIEW_REASON_MIN || input.reason.length > AUTH_REVIEW_REASON_MAX) throw invalidInputError(AUTH_ERROR_MESSAGES.staffInvitationInvalid);
  const token = generateOneTimeToken();
  const expiresAt = new Date(Date.now() + AUTH_INVITATION_HOURS * AUTH_HOUR_MS);
  const invitationLink = new URL('/invite/' + encodeURIComponent(token.rawToken), dependencies.config.publicBaseUrl).toString();
  const outbox = createEncryptedEmailOutboxMessage(dependencies.config, createInvitationEmail(input.email, invitationLink, input.role));
  await dependencies.staffRepository.issueStaffInvitation({
    id: randomUUID(), role: input.role, email: input.email.trim(), emailNormalized: normalizeEmail(input.email),
    displayName: input.displayName.trim(), tokenHash: token.tokenHash, permissionCodes,
    issuerId: input.issuerId, reason: input.reason.trim(), expiresAt, outbox
  });
  return { invited: true as const, expiresAt: expiresAt.toISOString() };
}
