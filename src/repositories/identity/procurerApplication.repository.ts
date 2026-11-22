import { randomUUID } from 'node:crypto';
import { AuthChallengePurpose, InvitationKind, Prisma, PrismaClient, ProcurerApplicationStatus, UserRole, UserStatus } from '../../generated/prisma/client.js';
import type { ProcurerApplicationRepository } from '../../interfaces/identity/procurerApplicationRepository.interface.js';
import type { ApplicationStatus, ApplicationSubmission } from '../../models/identity/procurerApplication.model.js';
import { AUTH_AUDIT_ACTIONS, AUTH_EMAIL_OUTBOX_TYPES, AUTH_OTP_DAILY_LIMIT, AUTH_OTP_DAILY_WINDOW_HOURS } from '../../constants/auths/auth.constants.js';
import { normalizeEmail } from '../../utils/auths/normalizeEmail.js';
import { applicationConflictError } from '../../errors/identity/procurerApplication.error.js';

export class PrismaProcurerApplicationRepository implements ProcurerApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async submitApplication(input: ApplicationSubmission): Promise<{ id: string; publicReference: string }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
      const application = await tx.procurerApplication.create({
        data: {
          id: input.id,
          publicReference: input.publicReference,
          applicantEmail: input.email,
          applicantEmailNormalized: input.emailNormalized,
          activeApplicationKey: input.emailNormalized,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          proposedCountry: input.proposedCountry,
          proposedRegion: input.proposedRegion,
          proposedCity: input.proposedCity,
          proposedArea: input.proposedArea,
          categories: [...input.categories],
          experience: input.experience,
          linkedUserId: input.linkedUserId,
          consentAt: input.consentAt,
          status: ProcurerApplicationStatus.EMAIL_VERIFICATION_PENDING,
          emailChallenges: { create: { id: input.challenge.id, emailNormalized: input.emailNormalized, purpose: AuthChallengePurpose.APPLICATION_EMAIL_VERIFICATION, digest: input.challenge.digest, expiresAt: input.challenge.expiresAt, resendAt: input.challenge.resendAt } }
        }
      });
      await tx.procurerApplicationStatusHistory.create({ data: { applicationId: application.id, nextStatus: ProcurerApplicationStatus.EMAIL_VERIFICATION_PENDING } });
      await tx.outboxEvent.create({ data: { id: input.verificationEmail.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[0], aggregateType: 'PROCURER_APPLICATION', aggregateId: application.id, dedupeKey: input.verificationEmail.dedupeKey, payload: { encryptedMessage: input.verificationEmail.payload } } });
        return { id: application.id, publicReference: input.publicReference };
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw applicationConflictError();
      throw error;
    }
  }

  async findEmailChallenge(challengeId: string, emailNormalized: string, now: Date) {
    const challenge = await this.prisma.emailOtpChallenge.findFirst({ where: { id: challengeId, emailNormalized, purpose: AuthChallengePurpose.APPLICATION_EMAIL_VERIFICATION, consumedAt: null, supersededAt: null, expiresAt: { gt: now } }, include: { application: { select: { publicReference: true, applicantEmail: true } } } });
    return challenge?.applicationId && challenge.application?.publicReference ? { id: challenge.id, digest: challenge.digest, attempts: challenge.attempts, maxAttempts: challenge.maxAttempts, applicationId: challenge.applicationId, publicReference: challenge.application.publicReference, applicantEmail: challenge.application.applicantEmail } : null;
  }

  async incrementEmailChallengeAttempt(challengeId: string, expectedAttempts: number, now: Date): Promise<boolean> {
    const updated = await this.prisma.emailOtpChallenge.updateMany({ where: { id: challengeId, purpose: AuthChallengePurpose.APPLICATION_EMAIL_VERIFICATION, consumedAt: null, supersededAt: null, expiresAt: { gt: now }, attempts: expectedAttempts, maxAttempts: { gt: expectedAttempts } }, data: { attempts: { increment: 1 } } });
    return updated.count === 1;
  }

  async createStatusLookup(input: Parameters<ProcurerApplicationRepository['createStatusLookup']>[0]): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.procurerApplication.findFirst({ where: { publicReference: input.publicReference, applicantEmailNormalized: input.emailNormalized, emailVerifiedAt: { not: null } }, select: { id: true } });
      if (!application) return false;
      const dailyCount = await tx.emailOtpChallenge.count({ where: { emailNormalized: input.emailNormalized, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, createdAt: { gt: new Date(input.now.getTime() - AUTH_OTP_DAILY_WINDOW_HOURS * 60 * 60 * 1000) } } });
      const previous = await tx.emailOtpChallenge.findFirst({ where: { emailNormalized: input.emailNormalized, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, consumedAt: null, supersededAt: null }, orderBy: { createdAt: 'desc' } });
      if (dailyCount >= AUTH_OTP_DAILY_LIMIT || (previous && previous.resendAt > input.now)) return false;
      await tx.emailOtpChallenge.updateMany({ where: { emailNormalized: input.emailNormalized, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, consumedAt: null, supersededAt: null }, data: { supersededAt: input.now } });
      await tx.emailOtpChallenge.create({ data: { id: input.id, emailNormalized: input.emailNormalized, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, digest: input.digest, applicationId: application.id, expiresAt: input.expiresAt, resendAt: input.resendAt } });
      await tx.outboxEvent.create({ data: { id: input.outbox.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[2], aggregateType: 'PROCURER_APPLICATION', aggregateId: application.id, dedupeKey: input.outbox.dedupeKey, payload: { encryptedMessage: input.outbox.payload } } });
      return true;
    });
  }

  async findStatusLookupChallenge(input: { id: string; emailNormalized: string; now: Date }) {
    const challenge = await this.prisma.emailOtpChallenge.findFirst({ where: { id: input.id, emailNormalized: input.emailNormalized, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, consumedAt: null, supersededAt: null, expiresAt: { gt: input.now } }, include: { application: { include: { statusHistory: { orderBy: { createdAt: 'asc' }, select: { nextStatus: true, reason: true, createdAt: true } } } } } });
    const application = challenge?.application;
    if (!challenge || !application?.publicReference) return null;
    return { id: challenge.id, applicationId: application.id, digest: challenge.digest, attempts: challenge.attempts, maxAttempts: challenge.maxAttempts, reference: application.publicReference, status: application.status, history: application.statusHistory.map((item) => ({ status: item.nextStatus, reason: item.reason, createdAt: item.createdAt })) };
  }

  async incrementStatusLookupAttempt(id: string, expectedAttempts: number, now: Date): Promise<boolean> {
    const result = await this.prisma.emailOtpChallenge.updateMany({ where: { id, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, consumedAt: null, supersededAt: null, expiresAt: { gt: now }, attempts: expectedAttempts, maxAttempts: { gt: expectedAttempts } }, data: { attempts: { increment: 1 } } });
    return result.count === 1;
  }

  async consumeStatusLookup(id: string, applicationId: string, expectedAttempts: number, now: Date): Promise<boolean> {
    const result = await this.prisma.emailOtpChallenge.updateMany({ where: { id, applicationId, purpose: AuthChallengePurpose.APPLICATION_STATUS_LOOKUP, consumedAt: null, supersededAt: null, expiresAt: { gt: now }, attempts: expectedAttempts, maxAttempts: { gt: expectedAttempts } }, data: { consumedAt: now } });
    return result.count === 1;
  }

  async consumeApplicationEmailChallenge(challengeId: string, applicationId: string, expectedAttempts: number, confirmationOutbox: { id: string; payload: string; dedupeKey: string }, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const challenge = await tx.emailOtpChallenge.updateMany({ where: { id: challengeId, applicationId, consumedAt: null, supersededAt: null, expiresAt: { gt: now }, attempts: expectedAttempts, maxAttempts: { gt: expectedAttempts } }, data: { consumedAt: now } });
      if (challenge.count !== 1) return false;
      const application = await tx.procurerApplication.updateMany({ where: { id: applicationId, status: ProcurerApplicationStatus.EMAIL_VERIFICATION_PENDING, emailVerifiedAt: null }, data: { emailVerifiedAt: now, status: ProcurerApplicationStatus.UNDER_REVIEW } });
      if (application.count !== 1) return false;
      await tx.procurerApplicationStatusHistory.create({ data: { applicationId, previousStatus: ProcurerApplicationStatus.EMAIL_VERIFICATION_PENDING, nextStatus: ProcurerApplicationStatus.UNDER_REVIEW } });
      await tx.auditLog.create({ data: { action: AUTH_AUDIT_ACTIONS.applicationEmailVerified, resourceType: 'PROCURER_APPLICATION', resourceId: applicationId } });
      await tx.outboxEvent.create({ data: { id: confirmationOutbox.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[2], aggregateType: 'PROCURER_APPLICATION', aggregateId: applicationId, dedupeKey: confirmationOutbox.dedupeKey, payload: { encryptedMessage: confirmationOutbox.payload } } });
      return true;
    });
  }

  async getOwnApplication(userId: string): Promise<ApplicationStatus | null> {
    const row = await this.prisma.procurerApplication.findFirst({ where: { linkedUserId: userId }, orderBy: { submittedAt: 'desc' }, include: { statusHistory: { orderBy: { createdAt: 'asc' }, select: { nextStatus: true, reason: true, createdAt: true } } } });
    return row ? mapApplication(row) : null;
  }

  async listApplications(status?: string): Promise<ApplicationStatus[]> {
    const rows = await this.prisma.procurerApplication.findMany({ where: status ? { status: status as ProcurerApplicationStatus } : {}, orderBy: { submittedAt: 'desc' }, take: 100, include: { statusHistory: { orderBy: { createdAt: 'asc' }, select: { nextStatus: true, reason: true, createdAt: true } } } });
    return rows.map(mapApplication);
  }

  async getApplication(applicationId: string): Promise<ApplicationStatus | null> {
    const row = await this.prisma.procurerApplication.findUnique({ where: { id: applicationId }, include: { statusHistory: { orderBy: { createdAt: 'asc' }, select: { nextStatus: true, reason: true, createdAt: true } } } });
    return row ? mapApplication(row) : null;
  }

  async getInvitationPreview(tokenHash: string, now: Date): Promise<{ email: string; displayName: string } | null> {
    const invitation = await this.prisma.accountInvitation.findUnique({ where: { tokenHash }, include: { application: true } });
    if (!invitation || invitation.kind !== InvitationKind.PROCURER || invitation.consumedAt || invitation.revokedAt || invitation.expiresAt <= now || invitation.application?.status !== ProcurerApplicationStatus.APPROVED) return null;
    return { email: invitation.emailNormalized, displayName: invitation.displayName };
  }

  async recordIdentityChecks(input: Parameters<ProcurerApplicationRepository['recordIdentityChecks']>[0]): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.procurerApplication.updateMany({ where: { id: input.applicationId, emailVerifiedAt: { not: null }, status: { in: [ProcurerApplicationStatus.UNDER_REVIEW, ProcurerApplicationStatus.MORE_INFO_REQUIRED] } }, data: { identityVerifiedAt: input.now, complianceVerifiedAt: input.now, identityEvidenceReference: input.identityEvidenceReference, complianceEvidenceReference: input.complianceEvidenceReference } });
      if (updated.count !== 1) return false;
      await tx.auditLog.create({ data: { actorId: input.reviewerId, action: 'PROCURER_APPLICATION_IDENTITY_CHECKED', resourceType: 'PROCURER_APPLICATION', resourceId: input.applicationId, metadata: { identityEvidenceReference: input.identityEvidenceReference, complianceEvidenceReference: input.complianceEvidenceReference } } });
      return true;
    });
  }

  async transitionApplication(input: Parameters<ProcurerApplicationRepository['transitionApplication']>[0]): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const allowedStatuses = [ProcurerApplicationStatus.UNDER_REVIEW, ProcurerApplicationStatus.MORE_INFO_REQUIRED];
      const row = await tx.procurerApplication.findFirst({ where: { id: input.applicationId, status: { in: allowedStatuses }, emailVerifiedAt: { not: null } } });
      if (!row || (input.nextStatus === 'APPROVED' && (!row.identityVerifiedAt || !row.complianceVerifiedAt))) return false;
      const updated = await tx.procurerApplication.updateMany({ where: { id: row.id, status: row.status }, data: { status: input.nextStatus, activeApplicationKey: input.nextStatus === 'MORE_INFO_REQUIRED' ? row.applicantEmailNormalized : null } });
      if (updated.count !== 1) return false;
      await tx.procurerApplicationStatusHistory.create({ data: { applicationId: row.id, previousStatus: row.status, nextStatus: input.nextStatus, reviewerId: input.actorId, reason: input.reason } });
      await tx.auditLog.create({ data: { actorId: input.actorId, action: 'PROCURER_APPLICATION_' + input.nextStatus, resourceType: 'PROCURER_APPLICATION', resourceId: row.id } });
      await tx.outboxEvent.create({ data: { id: input.notification.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[2], aggregateType: 'PROCURER_APPLICATION', aggregateId: row.id, dedupeKey: input.notification.dedupeKey, payload: { encryptedMessage: input.notification.payload } } });
      if (input.invitation) {
        await tx.accountInvitation.updateMany({ where: { applicationId: row.id, kind: InvitationKind.PROCURER, consumedAt: null, revokedAt: null }, data: { revokedAt: input.now } });
        await tx.accountInvitation.create({ data: { kind: InvitationKind.PROCURER, emailNormalized: row.applicantEmailNormalized, displayName: row.firstName + ' ' + row.lastName, tokenHash: input.invitation.tokenHash, applicationId: row.id, issuedById: input.actorId, expiresAt: input.invitation.expiresAt } });
        await tx.outboxEvent.create({ data: { id: input.invitation.outbox.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[3], aggregateType: 'PROCURER_APPLICATION', aggregateId: row.id, dedupeKey: input.invitation.outbox.dedupeKey, payload: { encryptedMessage: input.invitation.outbox.payload } } });
      }
      return true;
    });
  }

  async acceptProcurerInvitation(input: Parameters<ProcurerApplicationRepository['acceptProcurerInvitation']>[0]): Promise<{ accepted: boolean; userId?: string }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
      const invite = await tx.accountInvitation.findUnique({ where: { tokenHash: input.tokenHash }, include: { application: true } });
      if (!invite || invite.kind !== InvitationKind.PROCURER || invite.consumedAt || invite.revokedAt || invite.expiresAt <= input.now || !invite.application || invite.application.status !== ProcurerApplicationStatus.APPROVED) return { accepted: false };
      const applicationId = invite.applicationId;
      if (!applicationId) return { accepted: false };
      let userId = input.userId;
      if (userId) {
        const existing = await tx.user.findUnique({ where: { id: userId }, select: { emailNormalized: true, emailVerifiedAt: true } });
        if (!existing || existing.emailNormalized !== invite.emailNormalized || !existing.emailVerifiedAt) return { accepted: false };
        const role = await tx.roleAssignment.findFirst({ where: { userId, role: UserRole.PROCURER, revokedAt: null } });
        if (role) return { accepted: false };
      } else {
        if (!input.email || !input.emailNormalized || !input.displayName || !input.passwordHash || normalizeEmail(input.email) !== invite.emailNormalized) return { accepted: false };
        userId = randomUUID();
        await tx.user.create({ data: { id: userId, email: input.email, emailNormalized: invite.emailNormalized, displayName: input.displayName, emailVerifiedAt: input.now, status: UserStatus.ACTIVE, credential: { create: { passwordHash: input.passwordHash } } } });
      }
      const acceptedUserId = userId;
      if (!acceptedUserId) return { accepted: false };
      const profile = await tx.procurerProfile.findUnique({ where: { userId: acceptedUserId }, select: { id: true } });
      if (profile) return { accepted: false };
      const claimed = await tx.accountInvitation.updateMany({ where: { id: invite.id, consumedAt: null, revokedAt: null, expiresAt: { gt: input.now } }, data: { consumedAt: input.now, acceptedById: acceptedUserId } });
      if (claimed.count !== 1) return { accepted: false };
      await tx.roleAssignment.upsert({ where: { userId_role: { userId, role: UserRole.PROCURER } }, create: { userId, role: UserRole.PROCURER }, update: { revokedAt: null, grantedAt: input.now } });
      await tx.procurerProfile.create({ data: { userId: acceptedUserId, applicationId, status: 'PENDING_SETUP' } });
      await tx.procurerApplication.update({ where: { id: applicationId }, data: { linkedUserId: acceptedUserId } });
      await tx.auditLog.create({ data: { actorId: acceptedUserId, action: AUTH_AUDIT_ACTIONS.procurerInvitationAccepted, resourceType: 'PROCURER_APPLICATION', resourceId: applicationId } });
      await tx.outboxEvent.create({ data: { id: input.confirmationOutbox.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[4], aggregateType: 'USER', aggregateId: acceptedUserId, dedupeKey: input.confirmationOutbox.dedupeKey, payload: { encryptedMessage: input.confirmationOutbox.payload } } });
      return { accepted: true, userId: acceptedUserId };
      });
    } catch (error) {
      if (isInvitationRaceError(error)) return { accepted: false };
      throw error;
    }
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

function isInvitationRaceError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error.code === 'P2002' || error.code === 'P2034');
}

type ApplicationWithHistory = Prisma.ProcurerApplicationGetPayload<{ include: { statusHistory: { orderBy: { createdAt: 'asc' }; select: { nextStatus: true; reason: true; createdAt: true } } } }>;

function mapApplication(row: ApplicationWithHistory): ApplicationStatus {
  return { id: row.id, publicReference: row.publicReference ?? '', firstName: row.firstName, lastName: row.lastName, applicantEmail: row.applicantEmail, phone: row.phone, proposedCountry: row.proposedCountry, proposedRegion: row.proposedRegion, proposedCity: row.proposedCity, proposedArea: row.proposedArea, categories: row.categories, experience: row.experience, status: row.status, emailVerifiedAt: row.emailVerifiedAt?.toISOString() ?? null, identityVerifiedAt: row.identityVerifiedAt?.toISOString() ?? null, complianceVerifiedAt: row.complianceVerifiedAt?.toISOString() ?? null, submittedAt: row.submittedAt.toISOString(), updatedAt: row.updatedAt.toISOString(), statusHistory: row.statusHistory?.map((history) => ({ status: history.nextStatus, reason: history.reason, createdAt: history.createdAt.toISOString() })) ?? [] };
}
