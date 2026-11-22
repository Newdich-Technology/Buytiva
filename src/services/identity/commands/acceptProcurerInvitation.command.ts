import { AUTH_ERROR_MESSAGES } from '../../../constants/auths/auth.constants.js';
import { invalidInputError } from '../../../errors/auths/auth.error.js';
import { invitationEmailMismatchError, invitationInvalidError } from '../../../errors/identity/procurerApplication.error.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createSecurityEmail } from '../../../lib/email/emailTemplates.js';
import { validatePasswordStrength } from '../../../validators/auths/password.validator.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function acceptProcurerInvitationCommand(dependencies: AuthDependencies, input: { token: string; password?: string; confirmPassword?: string; userId?: string; email?: string; emailVerifiedAt?: Date | null }) {
  const tokenHash = hashOneTimeToken(input.token);
  const invitation = await dependencies.identityRepository.getInvitationPreview(tokenHash, new Date());
  if (!invitation) throw invitationInvalidError();
  const existingUser = Boolean(input.userId);
  let passwordHash: string | null = null;
  if (existingUser) {
    if (!input.email || normalizeEmail(input.email) !== invitation.email || !input.emailVerifiedAt) throw invitationEmailMismatchError();
  } else {
    if (!input.password || input.password !== input.confirmPassword) throw invalidInputError(AUTH_ERROR_MESSAGES.passwordConfirmationMismatch);
    try {
      validatePasswordStrength(input.password, dependencies.config.passwordMinLength, dependencies.config.passwordMaxLength);
    } catch {
      throw invalidInputError(AUTH_ERROR_MESSAGES.passwordPolicy);
    }
    passwordHash = await dependencies.passwordHasher.hashPassword(input.password);
  }
  const accepted = await dependencies.identityRepository.acceptProcurerInvitation({
    tokenHash,
    userId: input.userId ?? null,
    email: existingUser ? null : invitation.email,
    emailNormalized: existingUser ? null : invitation.email,
    displayName: existingUser ? null : invitation.displayName,
    passwordHash,
    confirmationOutbox: createEncryptedEmailOutboxMessage(dependencies.config, createSecurityEmail(invitation.email, 'Your BUYTIVA procurer access has been added. Complete authenticator setup and compliance before using procurer features.')),
    now: new Date()
  });
  if (!accepted.accepted) throw invitationInvalidError();
  return { accepted: true as const, userId: accepted.userId, profileStatus: 'PENDING_SETUP' as const };
}
