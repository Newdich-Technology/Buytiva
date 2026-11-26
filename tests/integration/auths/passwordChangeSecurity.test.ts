import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaAuthCredentialRepository } from '../../../src/repositories/auths/authCredential.repository.js';
import { hashOneTimeToken } from '../../../src/lib/security/oneTimeToken.js';

const url = process.env.AUTH_TEST_DATABASE_URL;
(url ? describe : describe.skip)('password change credential fencing', () => {
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
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: ids } } });
    await prisma.credential.deleteMany({ where: { userId: { in: ids } } });
    await prisma.auditLog.deleteMany({ where: { resourceId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });
  async function fixture() {
    const email = `${randomUUID()}@example.test`;
    const user = await prisma.user.create({ data: { email, emailNormalized: email, emailVerifiedAt: new Date(), credential: { create: { passwordHash: 'old-hash' } } } });
    ids.push(user.id);
    return user.id;
  }
  it('accepts only one concurrent change authenticated with the old password hash', async () => {
    const userId = await fixture();
    const outcomes = await Promise.all([
      repository.changePassword(userId, 'old-hash', 'new-hash-a', new Date()),
      repository.changePassword(userId, 'old-hash', 'new-hash-b', new Date())
    ]);
    expect(outcomes.filter(Boolean)).toHaveLength(1);
    const credential = await prisma.credential.findUniqueOrThrow({ where: { userId } });
    expect(['new-hash-a', 'new-hash-b']).toContain(credential.passwordHash);
    expect(await prisma.auditLog.count({ where: { resourceId: userId, action: 'AUTH_PASSWORD_CHANGED' } })).toBe(1);
    expect(await repository.changePassword(userId, 'old-hash', 'attacker-hash', new Date())).toBe(false);
  }, 30000);
  it('invalidates outstanding password reset tokens after a password change', async () => {
    const userId = await fixture();
    const tokenHash = hashOneTimeToken(randomUUID());
    await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt: new Date(Date.now() + 60000) } });
    expect(await repository.changePassword(userId, 'old-hash', 'new-hash', new Date())).toBe(true);
    expect(await repository.resetPassword(tokenHash, 'attacker-hash', new Date())).toBe(false);
    expect((await prisma.credential.findUniqueOrThrow({ where: { userId } })).passwordHash).toBe('new-hash');
  }, 30000);
  it('rejects an old-password change after a reset wins the race', async () => {
    const userId = await fixture();
    const tokenHash = hashOneTimeToken(randomUUID());
    await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt: new Date(Date.now() + 60000) } });
    expect(await repository.resetPassword(tokenHash, 'reset-hash', new Date())).toBe(true);
    expect(await repository.changePassword(userId, 'old-hash', 'stale-hash', new Date())).toBe(false);
    expect((await prisma.credential.findUniqueOrThrow({ where: { userId } })).passwordHash).toBe('reset-hash');
  }, 30000);
});
