import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaAuthSessionRepository } from '../../../src/repositories/auths/authSession.repository.js';
import { hashOneTimeToken } from '../../../src/lib/security/oneTimeToken.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
(databaseUrl ? describe : describe.skip)('session security under concurrency', () => {
  let prisma: PrismaClient;
  let repository: PrismaAuthSessionRepository;
  const ids: string[] = [];
  beforeAll(() => { prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) }); repository = new PrismaAuthSessionRepository(prisma); });
  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { session: { userId: { in: ids } } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });
  it('creates at most one successor and revokes its session on concurrent refresh replay', async () => {
    const email = `${randomUUID()}@example.invalid`;
    const user = await prisma.user.create({ data: { email, emailNormalized: email, emailVerifiedAt: new Date() } }); ids.push(user.id);
    const sessionId = randomUUID(); const token = randomUUID(); const familyId = randomUUID();
    const now = new Date(); const expires = new Date(now.getTime() + 60_000);
    await repository.createSession({ sessionId, refreshToken: token, refreshExpiresAt: expires, userId: user.id, tokenHash: hashOneTimeToken(sessionId), familyId, mfaAt: null, deviceLabel: null, expectedPasswordHash: null });
    const responses = await Promise.all([randomUUID(), randomUUID()].map((value) => repository.rotateRefreshToken(hashOneTimeToken(token), { tokenHash: hashOneTimeToken(value), refreshExpiresAt: expires }, now)));
    expect(responses.map((result) => result.status).sort()).toEqual(['REUSED', 'ROTATED']);
    expect(await prisma.refreshToken.count({ where: { sessionId } })).toBe(2);
    expect(await prisma.authSession.findUniqueOrThrow({ where: { id: sessionId } })).toMatchObject({ revokedReason: 'REFRESH_TOKEN_REUSE' });
    const successor = await prisma.refreshToken.findFirstOrThrow({ where: { sessionId, consumedAt: null } });
    expect((await repository.rotateRefreshToken(successor.tokenHash, { tokenHash: randomUUID(), refreshExpiresAt: expires }, now)).status).toBe('INVALID');
  });
  it('rejects expired sessions and prevents another user from revoking them', async () => {
    const email = `${randomUUID()}@example.invalid`;
    const user = await prisma.user.create({ data: { email, emailNormalized: email, emailVerifiedAt: new Date() } }); ids.push(user.id);
    const sessionId = randomUUID(); const token = randomUUID(); const now = new Date();
    await repository.createSession({ sessionId, refreshToken: token, refreshExpiresAt: new Date(now.getTime() - 1), userId: user.id, tokenHash: hashOneTimeToken(sessionId), familyId: randomUUID(), mfaAt: null, deviceLabel: null, expectedPasswordHash: null });
    await repository.revokeSession(sessionId, randomUUID(), 'USER_REVOKED_SESSION', now);
    expect((await prisma.authSession.findUniqueOrThrow({ where: { id: sessionId } })).revokedAt).toBeNull();
    expect((await repository.rotateRefreshToken(hashOneTimeToken(token), { tokenHash: randomUUID(), refreshExpiresAt: new Date(now.getTime() + 60_000) }, now)).status).toBe('INVALID');
    expect(await repository.listSessions(user.id, now)).toHaveLength(0);
  });
});
