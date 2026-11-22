import { PrismaClient, UserRole as PrismaUserRole, UserStatus as PrismaUserStatus } from '../../generated/prisma/client.js';
import type { AuthAccount, AuthPrincipal } from '../../models/auths/auth.model.js';
import type { PendingCustomerInput } from '../../interfaces/auths/authRepository.interface.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { UserStatus } from '../../enums/userStatus.enum.js';

export class PrismaAuthUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async registerPendingCustomer(input: PendingCustomerInput): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: input.id,
            email: input.email,
            emailNormalized: input.emailNormalized,
            displayName: input.displayName,
            status: UserStatus.ACTIVE,
            credential: { create: { passwordHash: input.passwordHash } },
            roleAssignments: { create: { role: UserRole.CUSTOMER } },
            emailOtpChallenges: {
              create: {
                id: input.challenge.id,
                emailNormalized: input.emailNormalized,
                purpose: 'EMAIL_VERIFICATION',
                digest: input.challenge.digest,
                expiresAt: input.challenge.expiresAt,
                resendAt: input.challenge.resendAt
              }
            }
          }
        });
        await tx.outboxEvent.create({
          data: {
            id: input.outbox.id,
            eventType: 'AUTH_EMAIL_VERIFICATION',
            aggregateType: 'USER',
            aggregateId: input.id,
            dedupeKey: input.outbox.dedupeKey,
            payload: { encryptedMessage: input.outbox.payload }
          }
        });
      });
      return true;
    } catch (error) {
      if (isUniqueConstraintError(error)) return false;
      throw error;
    }
  }

  async findAccountByEmail(emailNormalized: string): Promise<AuthAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { emailNormalized },
      include: {
        credential: true,
        roleAssignments: { where: { revokedAt: null } },
        mfaFactors: { where: { enabledAt: { not: null }, disabledAt: null }, orderBy: { createdAt: 'desc' }, take: 1 },
        staffProfile: true,
        procurerProfile: true
      }
    });
    if (!user) return null;
    const factor = user.mfaFactors[0];
    return {
      id: user.id,
      email: user.email,
      emailNormalized: user.emailNormalized,
      displayName: user.displayName,
      emailVerifiedAt: user.emailVerifiedAt,
      status: mapPrismaUserStatus(user.status),
      passwordHash: user.credential?.passwordHash ?? user.passwordHash,
      mustChangePassword: user.credential?.mustChangePassword ?? false,
      roles: user.roleAssignments.map((assignment) => mapPrismaUserRole(assignment.role)),
      mfaSecret: factor ? factor.secretCiphertext : null,
      lastAcceptedTimeStep: factor?.lastAcceptedTimeStep ?? null,
      staffStatus: user.staffProfile?.status ?? null,
      procurerStatus: user.procurerProfile?.status ?? null
    };
  }

  async findAccountById(userId: string): Promise<AuthAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        credential: true,
        roleAssignments: { where: { revokedAt: null } },
        mfaFactors: { where: { enabledAt: { not: null }, disabledAt: null }, orderBy: { createdAt: 'desc' }, take: 1 },
        staffProfile: true,
        procurerProfile: true
      }
    });
    if (!user) return null;
    const factor = user.mfaFactors[0];
    return {
      id: user.id,
      email: user.email,
      emailNormalized: user.emailNormalized,
      displayName: user.displayName,
      emailVerifiedAt: user.emailVerifiedAt,
      status: mapPrismaUserStatus(user.status),
      passwordHash: user.credential?.passwordHash ?? user.passwordHash,
      mustChangePassword: user.credential?.mustChangePassword ?? false,
      roles: user.roleAssignments.map((assignment) => mapPrismaUserRole(assignment.role)),
      mfaSecret: factor?.secretCiphertext ?? null,
      lastAcceptedTimeStep: factor?.lastAcceptedTimeStep ?? null,
      staffStatus: user.staffProfile?.status ?? null,
      procurerStatus: user.procurerProfile?.status ?? null
    };
  }

  async getAccessPrincipal(sessionId: string, userId: string, now: Date): Promise<AuthPrincipal | null> {
    const session = await this.prisma.authSession.findFirst({
      where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: now } },
      include: {
        user: {
          include: {
            credential: true,
            roleAssignments: { where: { revokedAt: null } },
            permissionGrants: { where: { revokedAt: null } },
            procurerProfile: true,
            staffProfile: true
          }
        }
      }
    });
    if (!session) return null;
    return {
      userId: session.userId,
      sessionId: session.id,
      email: session.user.email,
      displayName: session.user.displayName,
      roles: session.user.roleAssignments.map((item) => mapPrismaUserRole(item.role)),
      permissions: session.user.permissionGrants.map((item) => item.permission),
      emailVerifiedAt: session.user.emailVerifiedAt,
      userStatus: mapPrismaUserStatus(session.user.status),
      mustChangePassword: session.user.credential?.mustChangePassword ?? false,
      mfaAt: session.mfaVerifiedAt,
      sessionExpiresAt: session.expiresAt,
      procurerStatus: session.user.procurerProfile?.status ?? null,
      staffStatus: session.user.staffProfile?.status ?? null
    };
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

function mapPrismaUserRole(role: PrismaUserRole): UserRole {
  switch (role) {
    case PrismaUserRole.CUSTOMER: return UserRole.CUSTOMER;
    case PrismaUserRole.PROCURER: return UserRole.PROCURER;
    case PrismaUserRole.ADMIN: return UserRole.ADMIN;
    case PrismaUserRole.SUPER_ADMIN: return UserRole.SUPER_ADMIN;
  }
}

function mapPrismaUserStatus(status: PrismaUserStatus): UserStatus {
  switch (status) {
    case PrismaUserStatus.ACTIVE: return UserStatus.ACTIVE;
    case PrismaUserStatus.SUSPENDED: return UserStatus.SUSPENDED;
    case PrismaUserStatus.DEACTIVATED: return UserStatus.DEACTIVATED;
  }
}
