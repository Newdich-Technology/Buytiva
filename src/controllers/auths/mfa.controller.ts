import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { AuthPrincipal } from '../../models/auths/auth.model.js';
import { disableMfaCommand } from '../../services/auths/commands/disableMfa.command.js';
import { enrollTotpCommand } from '../../services/auths/commands/enrollTotp.command.js';
import { verifyTotpEnrollmentCommand } from '../../services/auths/commands/verifyTotpEnrollment.command.js';
import { getMfaStatusQuery } from '../../services/auths/queries/getMfaStatus.query.js';

export class MfaController {
  constructor(private readonly dependencies: AuthDependencies) {}

  enroll(principal: AuthPrincipal | null, input: { challengeToken?: string; currentPassword?: string }) {
    return enrollTotpCommand(this.dependencies, {
      userId: principal?.userId,
      challengeToken: input.challengeToken,
      currentPassword: input.currentPassword
    });
  }

  verifyEnrollment(principal: AuthPrincipal | null, input: { challengeToken?: string; code: string; deviceLabel?: string }) {
    return verifyTotpEnrollmentCommand(this.dependencies, {
      userId: principal?.userId,
      challengeToken: input.challengeToken,
      code: input.code,
      deviceLabel: input.deviceLabel
    });
  }

  status(principal: AuthPrincipal) {
    return getMfaStatusQuery(this.dependencies, principal.userId);
  }

  disable(principal: AuthPrincipal, input: { password: string; code: string }) {
    return disableMfaCommand(this.dependencies, principal.userId, input);
  }
}
