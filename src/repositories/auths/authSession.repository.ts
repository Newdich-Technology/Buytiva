import { invalidChallengeError } from '../../errors/auths/auth.error.js';
import { PrismaClient } from '../../generated/prisma/client.js';
import type { AuthRepository } from '../../interfaces/auths/authRepository.interface.js';
import type { IssuedSession } from '../../models/auths/auth.model.js';
import { hashOneTimeToken } from '../../lib/security/oneTimeToken.js';

export class PrismaAuthSessionRepository implements Pick<AuthRepository,
  'createSession' | 'rotateRefreshToken' | 'revokeSession' | 'revokeAllSessions' | 'listSessions'> {
  constructor(private readonly prisma: PrismaClient) {}

  async createSession(input: IssuedSession & {
    userId: string;
    tokenHash: string;
    familyId: string;
    mfaAt: Date | null;
    deviceLabel: string | null;
    expectedPasswordHash: string | null;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const locked = await tx.user.updateMany({ where: { id: input.userId, status: 'ACTIVE', emailVerifiedAt: { not: null } }, data: { updatedAt: new Date() } });
      if (!locked.count) throw invalidChallengeError();
      const account = await tx.user.findUniqueOrThrow({ where: { id: input.userId }, include: { credential: true } });
      if ((account.credential?.passwordHash ?? account.passwordHash) !== input.expectedPasswordHash) throw invalidChallengeError();
      await tx.authSession.create({
        data: {
          id: input.sessionId,
          userId: input.userId,
          tokenHash: input.tokenHash,
          familyId: input.familyId,
          expiresAt: input.refreshExpiresAt,
          mfaVerifiedAt: input.mfaAt,
          assurance: input.mfaAt ? 'MFA' : 'PASSWORD',
          deviceLabel: input.deviceLabel
        }
      });
      await tx.refreshToken.create({
        data: {
          sessionId: input.sessionId,
          familyId: input.familyId,
          tokenHash: hashOneTimeToken(input.refreshToken),
          expiresAt: input.refreshExpiresAt
        }
      });
    });
  }

  async rotateRefreshToken(
    tokenHash: string,
    next: { refreshExpiresAt: Date; tokenHash: string },
    now: Date
  ): Promise<{ status: 'ROTATED' | 'REUSED' | 'INVALID'; userId?: string; sessionId?: string }> {
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.refreshToken.findUnique({ where: { tokenHash }, include: { session: true } });
      if (!old) return { status: 'INVALID' };
      if (old.consumedAt) {
        await tx.authSession.updateMany({
          where: { familyId: old.familyId, revokedAt: null },
          data: { revokedAt: now, revokedReason: 'REFRESH_TOKEN_REUSE' }
        });
        return { status: 'REUSED' };
      }
      if (old.expiresAt <= now || old.session.revokedAt || old.session.expiresAt <= now) {
        return { status: 'INVALID' };
      }
      const consumed = await tx.refreshToken.updateMany({
        where: { id: old.id, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now, replacedByTokenHash: next.tokenHash }
      });
      if (consumed.count !== 1) {
        await tx.authSession.updateMany({
          where: { familyId: old.familyId, revokedAt: null },
          data: { revokedAt: now, revokedReason: 'REFRESH_TOKEN_REUSE' }
        });
        return { status: 'REUSED' };
      }
      await tx.refreshToken.create({
        data: {
          sessionId: old.sessionId,
          familyId: old.familyId,
          tokenHash: next.tokenHash,
          expiresAt: next.refreshExpiresAt
        }
      });
      await tx.authSession.update({ where: { id: old.sessionId }, data: { lastUsedAt: now } });
      return { status: 'ROTATED', userId: old.session.userId, sessionId: old.sessionId };
    });
  }

  async revokeSession(sessionId: string, userId: string, reason: string, now: Date): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: now, revokedReason: reason }
    });
  }

  async revokeAllSessions(userId: string, reason: string, now: Date): Promise<number> {
    const result = await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now, revokedReason: reason }
    });
    return result.count;
  }

  async listSessions(userId: string, now: Date) {
    return this.prisma.authSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, deviceLabel: true, createdAt: true, lastUsedAt: true, expiresAt: true }
    });
  }
}
