import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaAuthCredentialRepository } from '../../../src/repositories/auths/authCredential.repository.js';

const url = process.env.AUTH_TEST_DATABASE_URL;
(url ? describe : describe.skip)('MFA enrollment fencing', () => {
  let prisma: PrismaClient;
  let repository: PrismaAuthCredentialRepository;
  const ids: string[] = [];
  beforeAll(() => {
    if (process.env.BUYTIVA_DISPOSABLE_TEST_DB !== '1' || url !== process.env.DATABASE_URL || new URL(url!).pathname !== '/buytiva_test') throw new Error('Requires explicitly disposable buytiva_test database.');
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) });
    repository = new PrismaAuthCredentialRepository(prisma);
  });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.loginChallenge.deleteMany({ where: { userId: { in: ids } } });
    await prisma.mfaFactor.deleteMany({ where: { userId: { in: ids } } });
    await prisma.credential.deleteMany({ where: { userId: { in: ids } } });
    await prisma.auditLog.deleteMany({ where: { resourceId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });
  async function fixture() {
    const email = `${randomUUID()}@example.test`;
    const user = await prisma.user.create({ data: { email, emailNormalized: email, emailVerifiedAt: new Date(), credential: { create: { passwordHash: 'hash' } } } });
    ids.push(user.id);
    const challenge = await prisma.loginChallenge.create({ data: { userId: user.id, purpose: 'MFA_ENROLLMENT', tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 60000) } });
    return { userId: user.id, challengeId: challenge.id };
  }
  it('does not enable a replacement secret using a code verified against the earlier secret or consume the challenge', async () => {
    const { userId, challengeId } = await fixture();
    const oldSecret = Buffer.from('old encrypted secret'), newSecret = Buffer.from('new encrypted secret');
    expect(await repository.saveMfaEnrollment(userId, oldSecret, randomUUID(), 'hash', challengeId)).toBe(true);
    const oldFactor = (await repository.getMfaFactor(userId))!;
    expect(await repository.saveMfaEnrollment(userId, newSecret, randomUUID(), 'hash', challengeId)).toBe(true);
    expect(await repository.completeMfaEnrollment(userId, oldFactor.id, oldSecret, 'hash', 10n, new Date(), challengeId, 0)).toBe(false);
    expect((await prisma.loginChallenge.findUniqueOrThrow({ where: { id: challengeId } })).consumedAt).toBeNull();
    expect((await repository.getMfaFactor(userId))!.enabledAt).toBeNull();
    expect(await repository.completeMfaEnrollment(userId, oldFactor.id, newSecret, 'hash', 10n, new Date(), challengeId, 0)).toBe(true);
    expect((await repository.getMfaFactor(userId))!.enabledAt).not.toBeNull();
  }, 30000);
  it('serializes pending creation and rejects stale password or revoked enrollment challenges', async () => {
    const { userId, challengeId } = await fixture();
    const results = await Promise.all([
      repository.saveMfaEnrollment(userId, Buffer.from('first'), randomUUID(), 'hash', challengeId),
      repository.saveMfaEnrollment(userId, Buffer.from('second'), randomUUID(), 'hash', challengeId)
    ]);
    expect(results).toEqual([true, true]);
    expect(await prisma.mfaFactor.count({ where: { userId, disabledAt: null } })).toBe(1);
    const factor = (await repository.getMfaFactor(userId))!;
    expect(await repository.changePassword(userId, 'hash', 'new-hash', new Date())).toBe(true);
    expect(await repository.saveMfaEnrollment(userId, Buffer.from('stale'), randomUUID(), 'hash', challengeId)).toBe(false);
    expect(await repository.saveMfaEnrollment(userId, Buffer.from('stale'), randomUUID(), 'new-hash', challengeId)).toBe(false);
    expect(await repository.completeMfaEnrollment(userId, factor.id, factor.secretCiphertext, 'hash', 11n, new Date())).toBe(false);
    expect((await repository.getMfaFactor(userId))!.enabledAt).toBeNull();
  }, 30000);
});
