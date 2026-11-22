import { AUTH_ERROR_MESSAGES } from '../../../constants/auths/auth.constants.js';
import { invalidChallengeError, invalidInputError } from '../../../errors/auths/auth.error.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createSecurityEmail } from '../../../lib/email/emailTemplates.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { validatePasswordStrength } from '../../../validators/auths/password.validator.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function acceptStaffInvitationCommand(dependencies: AuthDependencies, input: { token: string; password?: string; confirmPassword?: string; userId?: string; email?: string; emailVerifiedAt?: Date | null }) {
  const tokenHash = hashOneTimeToken(input.token);
  const invitation = await dependencies.staffRepository.previewStaffInvitation(tokenHash, new Date());
  if (!invitation) throw invalidChallengeError();
  const existingUser = Boolean(input.userId);
  let passwordHash: string | null = null;
  if (existingUser) {
    if (!input.email || normalizeEmail(input.email) !== invitation.email || !input.emailVerifiedAt) throw invalidInputError(AUTH_ERROR_MESSAGES.inviteEmailMismatch);
  } else {
    if (!input.password || input.password !== input.confirmPassword) throw invalidInputError(AUTH_ERROR_MESSAGES.passwordConfirmationMismatch);
    try {
      validatePasswordStrength(input.password, dependencies.config.passwordMinLength, dependencies.config.passwordMaxLength);
    } catch {
      throw invalidInputError(AUTH_ERROR_MESSAGES.passwordPolicy);
    }
    passwordHash = await dependencies.passwordHasher.hashPassword(input.password);
  }
  const accepted = await dependencies.staffRepository.acceptStaffInvitation({
    tokenHash, userId: input.userId ?? null, email: existingUser ? null : invitation.email,
    displayName: existingUser ? null : invitation.displayName, passwordHash,
    confirmationOutbox: createEncryptedEmailOutboxMessage(dependencies.config, createSecurityEmail(invitation.email, 'Your BUYTIVA staff account was set up. Enroll an authenticator before staff access is enabled.')),
    now: new Date()
  });
  if (!accepted) throw invalidChallengeError();
  return { accepted: true as const, role: invitation.role, staffStatus: 'PENDING_SETUP' as const };
}
