import { PrismaClient } from '../../generated/prisma/client.js';
import type { AuthRepository } from '../../interfaces/auths/authRepository.interface.js';

export class PrismaAuthCredentialRepository implements Pick<AuthRepository,
  'requestPasswordReset' | 'resetPassword' | 'changePassword' | 'saveMfaEnrollment' |
  'getMfaFactor' | 'completeMfaEnrollment' | 'acceptTotpStep' | 'disableMfa'> {
  constructor(private readonly prisma: PrismaClient) {}

  async requestPasswordReset(emailNormalized: string, input: {
    id: string;
    tokenHash: string;
    expiresAt: Date;
    outbox: { id: string; payload: string; dedupeKey: string };
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { emailNormalized }, select: { id: true } });
      if (!user) return;
      // Serialize requests for this account before inspecting existing reset tokens.
      const locked = await tx.user.updateMany({ where: { id: user.id, emailNormalized }, data: { emailNormalized } });
      if (!locked.count) return;
      const now = new Date();
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: now }
      });
      await tx.passwordResetToken.create({
        data: { id: input.id, userId: user.id, tokenHash: input.tokenHash, expiresAt: input.expiresAt }
      });
      await tx.outboxEvent.create({
        data: {
          id: input.outbox.id,
          eventType: 'AUTH_PASSWORD_RESET',
          aggregateType: 'USER',
          aggregateId: user.id,
          dedupeKey: input.outbox.dedupeKey,
          payload: { encryptedMessage: input.outbox.payload }
        }
      });
    });
  }

  async resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const token = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
      if (!token || token.consumedAt || token.expiresAt <= now) return false;
      const locked = await tx.user.updateMany({ where: { id: token.userId }, data: { updatedAt: now } });
      if (!locked.count) return false;
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: token.id, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now }
      });
      if (consumed.count !== 1) return false;
      await tx.credential.update({
        where: { userId: token.userId },
        data: { passwordHash, mustChangePassword: false, passwordChangedAt: now }
      });
      await tx.loginChallenge.updateMany({ where: { userId: token.userId, consumedAt: null }, data: { consumedAt: now } });
      await tx.authSession.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: now, revokedReason: 'PASSWORD_RESET' }
      });
      await tx.auditLog.create({
        data: { action: 'AUTH_PASSWORD_RESET', resourceType: 'USER', resourceId: token.userId }
      });
      return true;
    });
  }

  async changePassword(userId: string, passwordHash: string, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.user.updateMany({ where: { id: userId }, data: { updatedAt: now } });
      if (!locked.count) return false;
      const changed = await tx.credential.updateMany({
        where: { userId },
        data: { passwordHash, mustChangePassword: false, passwordChangedAt: now }
      });
      if (changed.count !== 1) return false;
      await tx.loginChallenge.updateMany({ where: { userId, consumedAt: null }, data: { consumedAt: now } });
      await tx.authSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now, revokedReason: 'PASSWORD_CHANGED' }
      });
      await tx.auditLog.create({
        data: { action: 'AUTH_PASSWORD_CHANGED', resourceType: 'USER', resourceId: userId }
      });
      return true;
    });
  }

  async saveMfaEnrollment(userId: string, ciphertext: Uint8Array, factorId: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const enabled = await tx.mfaFactor.findFirst({ where: { userId, enabledAt: { not: null }, disabledAt: null } });
      if (enabled) return false;
      const pending = await tx.mfaFactor.findFirst({ where: { userId, enabledAt: null, disabledAt: null } });
      if (pending) {
        await tx.mfaFactor.update({ where: { id: pending.id }, data: { secretCiphertext: Buffer.from(ciphertext) } });
      } else {
        await tx.mfaFactor.create({ data: { id: factorId, userId, type: 'TOTP', secretCiphertext: Buffer.from(ciphertext) } });
      }
      return true;
    });
  }

  async getMfaFactor(userId: string) {
    return this.prisma.mfaFactor.findFirst({
      where: { userId, disabledAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, secretCiphertext: true, enabledAt: true, lastAcceptedTimeStep: true }
    });
  }

  async completeMfaEnrollment(
    userId: string,
    factorId: string,
    timeStep: bigint,
    now: Date,
    challengeId?: string,
    expectedAttempts?: number
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.user.updateMany({ where: { id: userId, status: 'ACTIVE', emailVerifiedAt: { not: null } }, data: { updatedAt: now } });
      if (!account.count) return false;
      if (challengeId && expectedAttempts !== undefined) {
        const challenge = await tx.loginChallenge.updateMany({
          where: {
            id: challengeId,
            userId,
            purpose: 'MFA_ENROLLMENT',
            consumedAt: null,
            expiresAt: { gt: now },
            attempts: expectedAttempts
          },
          data: { consumedAt: now }
        });
        if (challenge.count !== 1) return false;
      }
      const result = await tx.mfaFactor.updateMany({
        where: { id: factorId, userId, enabledAt: null, disabledAt: null },
        data: { enabledAt: now, lastAcceptedTimeStep: timeStep }
      });
      if (result.count !== 1) return false;
      await tx.staffProfile.updateMany({
        where: { userId, status: 'PENDING_SETUP' },
        data: { status: 'ACTIVE' }
      });
      await tx.procurerProfile.updateMany({
        where: { userId, status: 'PENDING_SETUP', application: { status: 'APPROVED', identityVerifiedAt: { not: null }, complianceVerifiedAt: { not: null } } },
        data: { status: 'ACTIVE' }
      });
      await tx.auditLog.create({
        data: { action: 'AUTH_MFA_ENABLED', resourceType: 'USER', resourceId: userId }
      });
      return true;
    });
  }

  async acceptTotpStep(userId: string, factorId: string, expectedStep: bigint | null, nextStep: bigint, now: Date): Promise<boolean> {
    if (expectedStep !== null && nextStep <= expectedStep) return false;
    const expected = expectedStep === null ? { lastAcceptedTimeStep: null } : { lastAcceptedTimeStep: expectedStep };
    const result = await this.prisma.mfaFactor.updateMany({
      where: { id: factorId, userId, enabledAt: { not: null }, disabledAt: null, ...expected },
      data: { lastAcceptedTimeStep: nextStep }
    });
    return result.count === 1;
  }

  async disableMfa(userId: string, factorId: string): Promise<boolean> {
    const result = await this.prisma.mfaFactor.updateMany({
      where: { id: factorId, userId, enabledAt: { not: null }, disabledAt: null },
      data: { disabledAt: new Date() }
    });
    return result.count === 1;
  }
}
