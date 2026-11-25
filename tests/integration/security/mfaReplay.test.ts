import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaAuthChallengeRepository } from '../../../src/repositories/auths/authChallenge.repository.js';
import { PrismaAuthCredentialRepository } from '../../../src/repositories/auths/authCredential.repository.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
(databaseUrl ? describe : describe.skip)('TOTP replay prevention', () => {
  let prisma: PrismaClient;
  beforeAll(() => { prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) }); });
  afterAll(async () => { await prisma.$disconnect(); });
  it('rejects repeated or older time steps, including on different challenges', async () => {
    const email = `${randomUUID()}@example.invalid`;
    const user = await prisma.user.create({ data: { email, emailNormalized: email } });
    const factor = await prisma.mfaFactor.create({ data: { userId: user.id, type: 'TOTP', secretCiphertext: Buffer.from('test'), enabledAt: new Date(), lastAcceptedTimeStep: 100n } });
    const createChallenge = () => prisma.loginChallenge.create({ data: { userId: user.id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 60_000) } });
    try {
      const repo = new PrismaAuthChallengeRepository(prisma);
      const credentials = new PrismaAuthCredentialRepository(prisma);
      const first = await createChallenge();
      expect(await repo.completeLoginChallenge(first.id, user.id, 0, 100n, new Date())).toBe(false);
      expect((await prisma.loginChallenge.findUniqueOrThrow({ where: { id: first.id } })).consumedAt).toBeNull();
      expect(await repo.completeLoginChallenge(first.id, user.id, 0, 99n, new Date())).toBe(false);
      expect(await credentials.acceptTotpStep(user.id, factor.id, 100n, 100n, new Date())).toBe(false);
      const second = await createChallenge();
      const results = await Promise.all([first, second].map((c) => repo.completeLoginChallenge(c.id, user.id, 0, 101n, new Date())));
      expect(results.filter(Boolean)).toHaveLength(1);
      expect((await prisma.mfaFactor.findUniqueOrThrow({ where: { id: factor.id } })).lastAcceptedTimeStep).toBe(101n);
      expect(await prisma.loginChallenge.count({ where: { userId: user.id, consumedAt: { not: null } } })).toBe(1);
      const invalid = await repo.completeLoginChallenge(randomUUID(), user.id, 0, 102n, new Date());
      expect(invalid).toBe(false);
      expect((await prisma.mfaFactor.findUniqueOrThrow({ where: { id: factor.id } })).lastAcceptedTimeStep).toBe(101n);
    } finally {
      await prisma.loginChallenge.deleteMany({ where: { userId: user.id } });
      await prisma.mfaFactor.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
});
