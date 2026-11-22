import type { ApplicationStatus, ApplicationSubmission } from '../../models/identity/procurerApplication.model.js';

export interface ProcurerApplicationRepository {
  submitApplication(input: ApplicationSubmission): Promise<{ id: string; publicReference: string }>;
  findEmailChallenge(challengeId: string, emailNormalized: string, now: Date): Promise<{ id: string; digest: string; attempts: number; maxAttempts: number; applicationId: string; publicReference: string; applicantEmail: string } | null>;
  incrementEmailChallengeAttempt(challengeId: string, expectedAttempts: number, now: Date): Promise<boolean>;
  consumeApplicationEmailChallenge(challengeId: string, applicationId: string, expectedAttempts: number, confirmationOutbox: { id: string; payload: string; dedupeKey: string }, now: Date): Promise<boolean>;
  createStatusLookup(input: { id: string; emailNormalized: string; publicReference: string; digest: string; expiresAt: Date; resendAt: Date; outbox: { id: string; payload: string; dedupeKey: string }; now: Date }): Promise<boolean>;
  findStatusLookupChallenge(input: { id: string; emailNormalized: string; now: Date }): Promise<{ id: string; applicationId: string; digest: string; attempts: number; maxAttempts: number; reference: string; status: string; history: { status: string; reason: string | null; createdAt: Date }[] } | null>;
  incrementStatusLookupAttempt(id: string, expectedAttempts: number, now: Date): Promise<boolean>;
  consumeStatusLookup(id: string, applicationId: string, expectedAttempts: number, now: Date): Promise<boolean>;
  getOwnApplication(userId: string): Promise<ApplicationStatus | null>;
  listApplications(status?: string): Promise<ApplicationStatus[]>;
  getApplication(applicationId: string): Promise<ApplicationStatus | null>;
  getInvitationPreview(tokenHash: string, now: Date): Promise<{ email: string; displayName: string } | null>;
  transitionApplication(input: { applicationId: string; actorId: string; nextStatus: 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED'; reason: string; notification: { id: string; payload: string; dedupeKey: string }; invitation?: { tokenHash: string; expiresAt: Date; outbox: { id: string; payload: string; dedupeKey: string } }; now: Date }): Promise<boolean>;
  acceptProcurerInvitation(input: { tokenHash: string; userId: string | null; email: string | null; emailNormalized: string | null; displayName: string | null; passwordHash: string | null; confirmationOutbox: { id: string; payload: string; dedupeKey: string }; now: Date }): Promise<{ accepted: boolean; userId?: string }>;
  recordIdentityChecks(input: { applicationId: string; reviewerId: string; identityEvidenceReference: string; complianceEvidenceReference: string; now: Date }): Promise<boolean>;
}
