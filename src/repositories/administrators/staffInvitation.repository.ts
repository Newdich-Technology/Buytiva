import { randomUUID } from 'node:crypto';
import { InvitationKind, Prisma, PrismaClient, StaffProfileStatus, UserRole, UserStatus } from '../../generated/prisma/client.js';
import type { StaffInvitationRepository, StaffInvitationRole } from '../../interfaces/administrators/staffInvitationRepository.interface.js';
import { AUTH_EMAIL_OUTBOX_TYPES } from '../../constants/auths/auth.constants.js';

export class PrismaStaffInvitationRepository implements StaffInvitationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async issueStaffInvitation(input: Parameters<StaffInvitationRepository['issueStaffInvitation']>[0]): Promise<void> {
    const kind = input.role === 'ADMIN' ? InvitationKind.ADMIN : InvitationKind.SUPER_ADMIN;
    await this.prisma.$transaction(async (tx) => {
      await tx.accountInvitation.updateMany({ where: { emailNormalized: input.emailNormalized, kind, consumedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.accountInvitation.create({ data: { id: input.id, kind, emailNormalized: input.emailNormalized, displayName: input.displayName, tokenHash: input.tokenHash, permissionCodes: [...input.permissionCodes], issuedById: input.issuerId, expiresAt: input.expiresAt } });
      await tx.outboxEvent.create({ data: { id: input.outbox.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[3], aggregateType: 'STAFF_INVITATION', aggregateId: input.id, dedupeKey: input.outbox.dedupeKey, payload: { encryptedMessage: input.outbox.payload } } });
      await tx.auditLog.create({ data: { actorId: input.issuerId, action: 'STAFF_INVITATION_ISSUED', resourceType: 'ACCOUNT_INVITATION', resourceId: input.id, metadata: { role: input.role, permissionCodes: [...input.permissionCodes], reason: input.reason } } });
    });
  }

  async previewStaffInvitation(tokenHash: string, now: Date) {
    const invitation = await this.prisma.accountInvitation.findUnique({ where: { tokenHash } });
    if (!invitation || (invitation.kind !== InvitationKind.ADMIN && invitation.kind !== InvitationKind.SUPER_ADMIN) || invitation.consumedAt || invitation.revokedAt || invitation.expiresAt <= now) return null;
    return { email: invitation.emailNormalized, displayName: invitation.displayName, role: invitation.kind as StaffInvitationRole, permissionCodes: invitation.permissionCodes };
  }

  async acceptStaffInvitation(input: Parameters<StaffInvitationRepository['acceptStaffInvitation']>[0]): Promise<boolean> {
    try {
      return await this.prisma.$transaction(async (tx) => {
      const invitation = await tx.accountInvitation.findUnique({ where: { tokenHash: input.tokenHash } });
      if (!invitation || (invitation.kind !== InvitationKind.ADMIN && invitation.kind !== InvitationKind.SUPER_ADMIN) || invitation.consumedAt || invitation.revokedAt || invitation.expiresAt <= input.now) return false;
      const role = invitation.kind === InvitationKind.ADMIN ? UserRole.ADMIN : UserRole.SUPER_ADMIN;
      let userId = input.userId;
      if (userId) {
        const user = await tx.user.findUnique({ where: { id: userId }, select: { emailNormalized: true, emailVerifiedAt: true, status: true } });
        if (!user || user.emailNormalized !== invitation.emailNormalized || !user.emailVerifiedAt || user.status !== UserStatus.ACTIVE) return false;
      } else {
        if (!input.email || !input.displayName || !input.passwordHash) return false;
        userId = randomUUID();
        await tx.user.create({ data: { id: userId, email: input.email, emailNormalized: invitation.emailNormalized, displayName: input.displayName, emailVerifiedAt: input.now, status: UserStatus.ACTIVE, credential: { create: { passwordHash: input.passwordHash } } } });
      }
      const acceptedUserId = userId;
      if (!acceptedUserId || await tx.staffProfile.findUnique({ where: { userId: acceptedUserId }, select: { id: true } })) return false;
      const claimed = await tx.accountInvitation.updateMany({ where: { id: invitation.id, consumedAt: null, revokedAt: null, expiresAt: { gt: input.now } }, data: { consumedAt: input.now, acceptedById: acceptedUserId } });
      if (claimed.count !== 1) return false;
      await tx.roleAssignment.upsert({ where: { userId_role: { userId: acceptedUserId, role } }, create: { userId: acceptedUserId, role, grantedById: invitation.issuedById }, update: { revokedAt: null, grantedAt: input.now, grantedById: invitation.issuedById } });
      await tx.staffProfile.create({ data: { userId: acceptedUserId, status: StaffProfileStatus.PENDING_SETUP } });
      if (role === UserRole.ADMIN) {
        for (const permission of invitation.permissionCodes) {
          await tx.userPermissionGrant.upsert({ where: { userId_permission: { userId: acceptedUserId, permission } }, create: { userId: acceptedUserId, permission, grantedById: invitation.issuedById }, update: { revokedAt: null, grantedAt: input.now, grantedById: invitation.issuedById } });
        }
      }
      await tx.auditLog.create({ data: { actorId: invitation.issuedById, action: 'STAFF_INVITATION_ACCEPTED', resourceType: 'USER', resourceId: acceptedUserId, metadata: { role } } });
      await tx.outboxEvent.create({ data: { id: input.confirmationOutbox.id, eventType: AUTH_EMAIL_OUTBOX_TYPES[4], aggregateType: 'USER', aggregateId: acceptedUserId, dedupeKey: input.confirmationOutbox.dedupeKey, payload: { encryptedMessage: input.confirmationOutbox.payload } } });
      return true;
      });
    } catch (error) {
      if (isInvitationRaceError(error)) return false;
      throw error;
    }
  }

  async updateStaffPermissions(input: Parameters<StaffInvitationRepository['updateStaffPermissions']>[0]): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const adminRole = await tx.roleAssignment.findFirst({ where: { userId: input.userId, role: UserRole.ADMIN, revokedAt: null } });
      const profile = await tx.staffProfile.findUnique({ where: { userId: input.userId } });
      if (!adminRole || !profile || profile.status === StaffProfileStatus.REVOKED) return false;
      await tx.userPermissionGrant.updateMany({ where: { userId: input.userId, revokedAt: null }, data: { revokedAt: input.now } });
      for (const permission of input.permissionCodes) {
        await tx.userPermissionGrant.upsert({ where: { userId_permission: { userId: input.userId, permission } }, create: { userId: input.userId, permission, grantedById: input.actorId }, update: { revokedAt: null, grantedAt: input.now, grantedById: input.actorId } });
      }
      await tx.authSession.updateMany({ where: { userId: input.userId, revokedAt: null }, data: { revokedAt: input.now, revokedReason: 'STAFF_PERMISSIONS_CHANGED' } });
      await tx.auditLog.create({ data: { actorId: input.actorId, action: 'STAFF_PERMISSIONS_CHANGED', resourceType: 'USER', resourceId: input.userId, metadata: { permissionCodes: [...input.permissionCodes], reason: input.reason } } });
      return true;
    });
  }

  async suspendStaff(input: { userId: string; actorId: string; reason: string; now: Date }): Promise<boolean> {
    return this.changeStaffAccess(input, StaffProfileStatus.SUSPENDED);
  }

  async revokeStaff(input: { userId: string; actorId: string; reason: string; now: Date }): Promise<boolean> {
    return this.changeStaffAccess(input, StaffProfileStatus.REVOKED);
  }

  async listStaff() {
    const users = await this.prisma.user.findMany({ where: { staffProfile: { isNot: null } }, include: { staffProfile: true, roleAssignments: { where: { revokedAt: null } }, permissionGrants: { where: { revokedAt: null } } }, orderBy: { createdAt: 'desc' }, take: 200 });
    return users.map((user) => ({ id: user.id, email: user.email, displayName: user.displayName, roles: user.roleAssignments.map((item) => item.role), status: user.staffProfile?.status ?? StaffProfileStatus.REVOKED, permissions: user.permissionGrants.map((item) => item.permission) }));
  }

  async listAuditLogs() {
    const records = await this.prisma.auditLog.findMany({ where: { resourceType: { in: ['USER', 'ACCOUNT_INVITATION', 'PROCURER_APPLICATION'] } }, orderBy: { createdAt: 'desc' }, take: 200 });
    return records.map((record) => ({ action: record.action, resourceType: record.resourceType, resourceId: record.resourceId, actorId: record.actorId, createdAt: record.createdAt.toISOString() }));
  }

  private async changeStaffAccess(input: { userId: string; actorId: string; reason: string; now: Date }, status: 'SUSPENDED' | 'REVOKED'): Promise<boolean> {
    try {
      return await this.prisma.$transaction(async (tx) => {
      const superAdmin = await tx.roleAssignment.findFirst({ where: { userId: input.userId, role: UserRole.SUPER_ADMIN, revokedAt: null } });
      if (superAdmin) {
        const activeCount = await tx.roleAssignment.count({ where: { role: UserRole.SUPER_ADMIN, revokedAt: null, user: { status: UserStatus.ACTIVE, staffProfile: { is: { status: StaffProfileStatus.ACTIVE } } } } });
        if (activeCount <= 1) return false;
      }
      const changed = await tx.staffProfile.updateMany({ where: { userId: input.userId, status: { not: StaffProfileStatus.REVOKED } }, data: { status } });
      if (changed.count !== 1) return false;
      if (status === StaffProfileStatus.REVOKED) await tx.roleAssignment.updateMany({ where: { userId: input.userId, role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }, revokedAt: null }, data: { revokedAt: input.now } });
      await tx.authSession.updateMany({ where: { userId: input.userId, revokedAt: null }, data: { revokedAt: input.now, revokedReason: status } });
      await tx.auditLog.create({ data: { actorId: input.actorId, action: status === StaffProfileStatus.SUSPENDED ? 'STAFF_SUSPENDED' : 'STAFF_REVOKED', resourceType: 'USER', resourceId: input.userId, metadata: { reason: input.reason } } });
      return true;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') return false;
      throw error;
    }
  }
}

function isInvitationRaceError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error.code === 'P2002' || error.code === 'P2034');
}
