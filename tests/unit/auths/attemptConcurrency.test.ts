import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaAuthChallengeRepository } from '../../../src/repositories/auths/authChallenge.repository.js';
import { AUTH_OTP_MAX_ATTEMPTS } from '../../../src/constants/auths/auth.constants.js';

describe('challenge retry accounting', () => {
  it.each(['emailOtpChallenge', 'loginChallenge'] as const)('increments each valid failure atomically for %s', async (table) => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = { [table]: { updateMany } } as unknown as PrismaClient;
    const repo = new PrismaAuthChallengeRepository(prisma);
    const now = new Date();
    const increment = table === 'emailOtpChallenge' ? repo.incrementOtpAttempt.bind(repo) : repo.incrementLoginAttempt.bind(repo);
    expect(await increment('id', 0, now)).toBe(true);
    const query = updateMany.mock.calls[0]![0];
    expect(query.where.attempts).toEqual({ lt: AUTH_OTP_MAX_ATTEMPTS });
    expect(query.where.AND).toBeUndefined();
    expect(query.data.attempts).toEqual({ increment: 1 });
    expect(query.where.consumedAt).toBeNull();
    expect(query.where.expiresAt).toEqual({ gt: now });
  });
});
