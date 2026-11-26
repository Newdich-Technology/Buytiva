import { AuthChallengePurpose, LoginChallengePurpose, Prisma, PrismaClient } from '../../generated/prisma/client.js';
import { AUTH_OTP_DAILY_LIMIT, AUTH_OTP_DAILY_WINDOW_HOURS, AUTH_OTP_MAX_ATTEMPTS } from '../../constants/auths/auth.constants.js';
import type { CreateOtpInput } from '../../interfaces/auths/authRepository.interface.js';
import type { AuthRepository } from '../../interfaces/auths/authRepository.interface.js';
import type { EmailOtpRecord } from '../../models/auths/auth.model.js';
import { AUTH_AUDIT_ACTIONS } from '../../constants/auths/auth.constants.js';
import { concurrentEmailVerificationError } from '../../errors/auths/auth.error.js';

export class PrismaAuthChallengeRepository implements Pick<AuthRepository,
  'findOtpChallenge' | 'createOtpChallenge' | 'incrementOtpAttempt' | 'consumeEmailVerification' |
  'createLoginChallenge' | 'findLoginChallenge' | 'incrementLoginAttempt' | 'completeLoginChallenge'> {
  constructor(private readonly prisma: PrismaClient) {}

  async findOtpChallenge(id: string, emailNormalized: string, purpose: string): Promise<EmailOtpRecord | null> {
    const record = await this.prisma.emailOtpChallenge.findFirst({
      where: { id, emailNormalized, purpose: purpose as AuthChallengePurpose }
    });
    return record ? { ...record, purpose: record.purpose } : null;
  }

  async createOtpChallenge(input: CreateOtpInput): Promise<boolean> {
    const now = new Date();
    const dayStart = new Date(now.getTime() - AUTH_OTP_DAILY_WINDOW_HOURS * 60 * 60 * 1000);
    try {
      return await this.prisma.$transaction(async (tx) => {
      const dailyCount = await tx.emailOtpChallenge.count({
        where: { emailNormalized: input.emailNormalized, purpose: input.purpose as AuthChallengePurpose, createdAt: { gt: dayStart } }
      });
      if (dailyCount >= AUTH_OTP_DAILY_LIMIT) return false;
      const recent = await tx.emailOtpChallenge.findFirst({
        where: {
          emailNormalized: input.emailNormalized,
          purpose: input.purpose as AuthChallengePurpose,
          consumedAt: null,
          supersededAt: null
        },
        orderBy: { createdAt: 'desc' }
      });
      if (recent && recent.resendAt > now) return false;
      await tx.emailOtpChallenge.updateMany({
        where: { emailNormalized: input.emailNormalized, purpose: input.purpose as AuthChallengePurpose, consumedAt: null },
        data: { supersededAt: now }
      });
      await tx.emailOtpChallenge.create({
        data: {
          id: input.id,
          emailNormalized: input.emailNormalized,
          purpose: input.purpose as AuthChallengePurpose,
          digest: input.digest,
          userId: input.userId,
          applicationId: input.applicationId,
          expiresAt: input.expiresAt,
          resendAt: input.resendAt
        }
      });
      await tx.outboxEvent.create({
        data: {
          id: input.outbox.id,
          eventType: 'AUTH_EMAIL_VERIFICATION',
          aggregateType: input.applicationId ? 'PROCURER_APPLICATION' : 'USER',
          aggregateId: input.applicationId ?? input.userId ?? input.id,
          dedupeKey: input.outbox.dedupeKey,
          payload: { encryptedMessage: input.outbox.payload }
        }
      });
      return true;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      // A competing resend may win; return the same generic accepted response.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return false;
      throw error;
    }
  }

  async incrementOtpAttempt(id: string, _expectedAttempts: number, now: Date): Promise<boolean> {
    const result = await this.prisma.emailOtpChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        supersededAt: null,
        expiresAt: { gt: now },
        attempts: { lt: AUTH_OTP_MAX_ATTEMPTS }
      },
      data: { attempts: { increment: 1 } }
    });
    return result.count === 1;
  }

  async consumeEmailVerification(id: string, expectedAttempts: number, userId: string, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.emailOtpChallenge.updateMany({
        where: {
          id,
          userId,
          consumedAt: null,
          supersededAt: null,
          expiresAt: { gt: now },
          AND: [{ attempts: expectedAttempts }, { attempts: { lt: AUTH_OTP_MAX_ATTEMPTS } }]
        },
        data: { consumedAt: now }
      });
      if (updated.count !== 1) return false;
      const userUpdated = await tx.user.updateMany({
        where: { id: userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: now }
      });
      if (userUpdated.count !== 1) throw concurrentEmailVerificationError();
      await tx.auditLog.create({
        data: { action: AUTH_AUDIT_ACTIONS.emailVerified, resourceType: 'USER', resourceId: userId }
      });
      return true;
    });
  }

  async createLoginChallenge(input: { id: string; userId: string; tokenHash: string; purpose: 'LOGIN_MFA' | 'MFA_ENROLLMENT'; expiresAt: Date }): Promise<void> {
    await this.prisma.loginChallenge.create({ data: { ...input, purpose: input.purpose as LoginChallengePurpose } });
  }

  async findLoginChallenge(tokenHash: string) {
    return this.prisma.loginChallenge.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, purpose: true, attempts: true, maxAttempts: true, expiresAt: true, consumedAt: true }
    });
  }

  async incrementLoginAttempt(id: string, _expectedAttempts: number, now: Date): Promise<boolean> {
    const result = await this.prisma.loginChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: AUTH_OTP_MAX_ATTEMPTS }
      },
      data: { attempts: { increment: 1 } }
    });
    return result.count === 1;
  }

  async completeLoginChallenge(
    id: string,
    userId: string,
    expectedAttempts: number,
    timeStep: bigint,
    now: Date
  ): Promise<boolean> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const factor = await tx.mfaFactor.findFirst({ where: { userId, enabledAt: { not: null }, disabledAt: null } });
        if (!factor) return false;
        const accepted = await tx.mfaFactor.updateMany({
          where: { id: factor.id, userId, enabledAt: { not: null }, disabledAt: null,
            OR: [{ lastAcceptedTimeStep: null }, { lastAcceptedTimeStep: { lt: timeStep } }] },
          data: { lastAcceptedTimeStep: timeStep }
        });
        if (accepted.count !== 1) return false;
        const challenge = await tx.loginChallenge.updateMany({
          where: { id, userId, purpose: LoginChallengePurpose.LOGIN_MFA, consumedAt: null,
            expiresAt: { gt: now }, AND: [{ attempts: expectedAttempts }, { attempts: { lt: AUTH_OTP_MAX_ATTEMPTS } }] },
          data: { consumedAt: now }
        });
        // Throw so a concurrently consumed or expired challenge rolls the factor update back.
        if (challenge.count !== 1) throw new ChallengeRace();
        return true;
      });
    } catch (error) {
      if (error instanceof ChallengeRace) return false;
      throw error;
    }
  }
}

class ChallengeRace extends Error {}
