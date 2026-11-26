import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaAuthChallengeRepository } from '../../../src/repositories/auths/authChallenge.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { AUTH_OTP_MAX_ATTEMPTS } from '../../../src/constants/auths/auth.constants.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite('concurrent authentication failures', () => {
  let prisma: PrismaClient;
  beforeAll(() => { prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) }); });
  afterAll(async () => { await prisma.$disconnect(); });

  it('counts concurrent wrong OTPs without exceeding the limit', async () => {
    const challenge = await prisma.emailOtpChallenge.create({ data: {
      emailNormalized: 'concurrency-test@example.invalid', purpose: 'EMAIL_VERIFICATION', digest: 'test',
      expiresAt: new Date(Date.now() + 60_000), resendAt: new Date()
    } });
    try {
      const repo = new PrismaAuthChallengeRepository(prisma);
      const attempts = await Promise.all(Array.from({ length: 12 }, () => repo.incrementOtpAttempt(challenge.id, 0, new Date())));
      const saved = await prisma.emailOtpChallenge.findUniqueOrThrow({ where: { id: challenge.id } });
      expect(attempts.filter(Boolean)).toHaveLength(AUTH_OTP_MAX_ATTEMPTS);
      expect(saved.attempts).toBe(AUTH_OTP_MAX_ATTEMPTS);
      expect(await repo.consumeEmailVerification(challenge.id, saved.attempts, '00000000-0000-0000-0000-000000000000', new Date())).toBe(false);
    } finally {
      await prisma.emailOtpChallenge.delete({ where: { id: challenge.id } });
    }
  });

  it.each(['APPLICATION_EMAIL_VERIFICATION', 'APPLICATION_STATUS_LOOKUP'] as const)('counts concurrent failures for %s', async (purpose) => {
    const challenge = await prisma.emailOtpChallenge.create({ data: { emailNormalized: 'attempts@example.invalid', purpose, digest: 'test', maxAttempts: 3, expiresAt: new Date(Date.now() + 60_000), resendAt: new Date() } });
    try {
      const repo = new PrismaProcurerApplicationRepository(prisma);
      const results = await Promise.all(Array.from({ length: 10 }, () => purpose === 'APPLICATION_EMAIL_VERIFICATION'
        ? repo.incrementEmailChallengeAttempt(challenge.id, 0, new Date())
        : repo.incrementStatusLookupAttempt(challenge.id, 0, new Date())));
      expect(results.filter(Boolean)).toHaveLength(3);
      expect((await prisma.emailOtpChallenge.findUniqueOrThrow({ where: { id: challenge.id } })).attempts).toBe(3);
    } finally {
      await prisma.emailOtpChallenge.delete({ where: { id: challenge.id } });
    }
  });

  it('counts concurrent wrong MFA attempts without exceeding the limit', async () => {
    const user = await prisma.user.create({ data: { email: 'mfa-concurrency@example.invalid', emailNormalized: 'mfa-concurrency@example.invalid' } });
    const challenge = await prisma.loginChallenge.create({ data: { userId: user.id, tokenHash: `test-${user.id}`, expiresAt: new Date(Date.now() + 60_000) } });
    try {
      const repo = new PrismaAuthChallengeRepository(prisma);
      const attempts = await Promise.all(Array.from({ length: 12 }, () => repo.incrementLoginAttempt(challenge.id, 0, new Date())));
      const saved = await prisma.loginChallenge.findUniqueOrThrow({ where: { id: challenge.id } });
      expect(attempts.filter(Boolean)).toHaveLength(AUTH_OTP_MAX_ATTEMPTS);
      expect(saved.attempts).toBe(AUTH_OTP_MAX_ATTEMPTS);
    } finally {
      await prisma.loginChallenge.delete({ where: { id: challenge.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
});
