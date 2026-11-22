import { randomUUID } from 'node:crypto';
import { AUTH_HOUR_MS, AUTH_INVITATION_HOURS, AUTH_REVIEW_REASON_MAX, AUTH_REVIEW_REASON_MIN } from '../../../constants/auths/auth.constants.js';
import { applicationUnavailableError, identityEvidenceRequiredError, reviewReasonRequiredError } from '../../../errors/identity/procurerApplication.error.js';
import { createInvitationEmail, createStatusEmail } from '../../../lib/email/emailTemplates.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { generateOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function reviewProcurerApplicationCommand(dependencies: AuthDependencies, input: { applicationId: string; reviewerId: string; decision: 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED'; reason: string }) {
  const reason = input.reason.trim();
  if (reason.length < AUTH_REVIEW_REASON_MIN || reason.length > AUTH_REVIEW_REASON_MAX) throw reviewReasonRequiredError();
  const application = await dependencies.identityRepository.getApplication(input.applicationId);
  if (!application) throw applicationUnavailableError();
  if (input.decision === 'APPROVED' && (!application.identityVerifiedAt || !application.complianceVerifiedAt)) throw identityEvidenceRequiredError();
  const now = new Date();
  const statusMessage = createEncryptedEmailOutboxMessage(dependencies.config, createStatusEmail(application.applicantEmail, input.decision, reason));
  let invitation: Parameters<AuthDependencies['identityRepository']['transitionApplication']>[0]['invitation'];
  if (input.decision === 'APPROVED') {
    const token = generateOneTimeToken();
    const expiresAt = new Date(now.getTime() + AUTH_INVITATION_HOURS * AUTH_HOUR_MS);
    const link = new URL('/invite/' + encodeURIComponent(token.rawToken), dependencies.config.publicBaseUrl).toString();
    invitation = {
      tokenHash: token.tokenHash,
      expiresAt,
      outbox: createEncryptedEmailOutboxMessage(dependencies.config, createInvitationEmail(application.applicantEmail, link, 'PROCURER'))
    };
  }
  const changed = await dependencies.identityRepository.transitionApplication({
    applicationId: input.applicationId,
    actorId: input.reviewerId,
    nextStatus: input.decision,
    reason,
    notification: statusMessage,
    invitation,
    now
  });
  if (!changed) throw applicationUnavailableError();
  return { updated: true as const, status: input.decision };
}

export async function recordProcurerIdentityChecksCommand(dependencies: AuthDependencies, input: { applicationId: string; reviewerId: string; identityEvidenceReference: string; complianceEvidenceReference: string }) {
  if (input.identityEvidenceReference.length < 16 || input.complianceEvidenceReference.length < 16) throw identityEvidenceRequiredError();
  const saved = await dependencies.identityRepository.recordIdentityChecks({ ...input, now: new Date() });
  if (!saved) throw applicationUnavailableError();
  return { checksRecorded: true as const };
}
