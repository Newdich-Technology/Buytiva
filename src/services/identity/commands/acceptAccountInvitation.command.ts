import { invalidChallengeError } from '../../../errors/auths/auth.error.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import type { AuthPrincipal } from '../../../models/auths/auth.model.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';
import { acceptProcurerInvitationCommand } from './acceptProcurerInvitation.command.js';
import { acceptStaffInvitationCommand } from '../../administrators/commands/acceptStaffInvitation.command.js';

export async function acceptAccountInvitationCommand(dependencies: AuthDependencies, input: { token: string; password?: string; confirmPassword?: string }, principal?: AuthPrincipal) {
  const tokenHash = hashOneTimeToken(input.token);
  const staffInvitation = await dependencies.staffRepository.previewStaffInvitation(tokenHash, new Date());
  const accountInput = { ...input, userId: principal?.userId, email: principal?.email, emailVerifiedAt: principal?.emailVerifiedAt };
  if (staffInvitation) return acceptStaffInvitationCommand(dependencies, accountInput);
  const procurerInvitation = await dependencies.identityRepository.getInvitationPreview(tokenHash, new Date());
  if (!procurerInvitation) throw invalidChallengeError();
  return acceptProcurerInvitationCommand(dependencies, accountInput);
}
