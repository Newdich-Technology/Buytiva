import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { AuthPrincipal } from '../../models/auths/auth.model.js';
import { submitProcurerApplicationCommand } from '../../services/identity/commands/submitProcurerApplication.command.js';
import { verifyProcurerApplicationEmailCommand } from '../../services/identity/commands/verifyProcurerApplicationEmail.command.js';
import { acceptAccountInvitationCommand } from '../../services/identity/commands/acceptAccountInvitation.command.js';
import { recordProcurerIdentityChecksCommand, reviewProcurerApplicationCommand } from '../../services/identity/commands/reviewProcurerApplication.command.js';
import { getOwnProcurerApplicationQuery } from '../../services/identity/queries/getOwnProcurerApplication.query.js';
import { getProcurerApplicationQuery, listProcurerApplicationsQuery } from '../../services/identity/queries/listProcurerApplications.query.js';
import { requestApplicationStatusLookupCommand } from '../../services/identity/commands/requestApplicationStatusLookup.command.js';
import { verifyApplicationStatusLookupQuery } from '../../services/identity/queries/verifyApplicationStatusLookup.query.js';
import { getAccountInvitationPreviewQuery } from '../../services/identity/queries/getAccountInvitationPreview.query.js';

export class ProcurerApplicationController {
  constructor(private readonly dependencies: AuthDependencies) {}

  submit(input: Parameters<typeof submitProcurerApplicationCommand>[1], principal?: AuthPrincipal) {
    return submitProcurerApplicationCommand(this.dependencies, input, principal);
  }

  verifyEmail(input: { email: string; challengeId: string; code: string }) {
    return verifyProcurerApplicationEmailCommand(this.dependencies, input);
  }

  requestStatusLookup(input: { email: string; reference: string }) {
    return requestApplicationStatusLookupCommand(this.dependencies, input);
  }

  verifyStatusLookup(input: { email: string; challengeId: string; code: string }) {
    return verifyApplicationStatusLookupQuery(this.dependencies, input);
  }

  ownApplication(userId: string) {
    return getOwnProcurerApplicationQuery(this.dependencies, userId);
  }

  list(status?: string) {
    return listProcurerApplicationsQuery(this.dependencies, status);
  }

  get(applicationId: string) {
    return getProcurerApplicationQuery(this.dependencies, applicationId);
  }

  previewInvitation(tokenHash: string) {
    return getAccountInvitationPreviewQuery(this.dependencies, tokenHash);
  }

  acceptInvitation(input: { token: string; password?: string; confirmPassword?: string }, principal?: AuthPrincipal) {
    return acceptAccountInvitationCommand(this.dependencies, input, principal);
  }

  recordChecks(input: { applicationId: string; reviewerId: string; identityEvidenceReference: string; complianceEvidenceReference: string }) {
    return recordProcurerIdentityChecksCommand(this.dependencies, input);
  }

  review(input: { applicationId: string; reviewerId: string; decision: 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED'; reason: string }) {
    return reviewProcurerApplicationCommand(this.dependencies, input);
  }
}
