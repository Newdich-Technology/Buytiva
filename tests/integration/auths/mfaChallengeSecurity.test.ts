import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import * as OTPAuth from 'otpauth';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';
import { Argon2PasswordHasher } from '../../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';
import { decryptSecret, encryptSecret } from '../../../src/lib/security/secretBox.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const url = process.env.AUTH_TEST_DATABASE_URL;
const config = { tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000', otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000',
  encryptionKey: Buffer.alloc(32, 47), publicBaseUrl: 'https://buytiva.example', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };
const password = 'SecureStaffPassword42!';
(url ? describe : describe.skip)('privileged MFA challenge security', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  const ids: string[] = [];
  const hasher = new Argon2PasswordHasher();
  beforeAll(() => {
    if (process.env.BUYTIVA_DISPOSABLE_TEST_DB !== '1' || url !== process.env.DATABASE_URL || new URL(url!).pathname !== '/buytiva_test') throw new Error('Requires explicitly disposable buytiva_test database.');
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) });
  });
  beforeEach(async () => {
    const deps: AuthDependencies = { config, repository: createPrismaAuthRepository(prisma), identityRepository: new PrismaProcurerApplicationRepository(prisma),
      staffRepository: new PrismaStaffInvitationRepository(prisma), passwordHasher: hasher, emailProvider: new MemoryEmailProvider() };
    app = createBuytivaFastifyApplication({ authDependencies: deps });
    await app.ready();
  });
  afterEach(async () => { await app.close(); });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.refreshToken.deleteMany({ where: { session: { userId: { in: ids } } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: ids } } });
    await prisma.loginChallenge.deleteMany({ where: { userId: { in: ids } } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: ids } } });
    await prisma.mfaFactor.deleteMany({ where: { userId: { in: ids } } });
    await prisma.staffProfile.deleteMany({ where: { userId: { in: ids } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: ids } } });
    await prisma.credential.deleteMany({ where: { userId: { in: ids } } });
    await prisma.auditLog.deleteMany({ where: { resourceId: { in: ids } } });
    await prisma.outboxEvent.deleteMany({ where: { aggregateId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });
  const post = (path: string, payload: object) => app.inject({ method: 'POST', url: `/api/v1${path}`, payload });
  async function setup() {
    const email = `${randomUUID()}@example.test`, secret = new OTPAuth.Secret({ size: 20 }).base32;
    const user = await prisma.user.create({ data: { email, emailNormalized: email, emailVerifiedAt: new Date(),
      credential: { create: { passwordHash: await hasher.hashPassword(password) } }, roleAssignments: { create: { role: 'ADMIN' } },
      staffProfile: { create: { status: 'ACTIVE' } }, mfaFactors: { create: { type: 'TOTP', enabledAt: new Date(), secretCiphertext: Buffer.from(encryptSecret(secret, config.encryptionKey)) } } } });
    ids.push(user.id);
    const login = await post('/auth/login', { email, password });
    expect(login.statusCode).toBe(200);
    const challenge = login.json<{ challengeType: string; challengeToken: string }>();
    expect(challenge.challengeType).toBe('LOGIN_MFA');
    const code = new OTPAuth.TOTP({ issuer: 'BUYTIVA', label: email, algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) }).generate();
    return { user, email, code, token: challenge.challengeToken };
  }
  it('rejects an outstanding MFA challenge after suspension', async () => {
    const { user, code, token } = await setup();
    await prisma.user.update({ where: { id: user.id }, data: { status: 'SUSPENDED' } });
    expect((await post('/auth/login/complete', { challengeToken: token, code })).statusCode).toBe(401);
    expect(await prisma.authSession.count({ where: { userId: user.id } })).toBe(0);
  });
  it('invalidates outstanding MFA challenges after password reset', async () => {
    const { user, email, code, token } = await setup();
    const oldHash = (await prisma.credential.findUniqueOrThrow({ where: { userId: user.id } })).passwordHash;
    expect((await post('/auth/password/forgot', { email })).statusCode).toBe(202);
    const event = await prisma.outboxEvent.findFirstOrThrow({ where: { aggregateId: user.id, eventType: 'AUTH_PASSWORD_RESET' } });
    const text = (JSON.parse(decryptSecret((event.payload as { encryptedMessage: string }).encryptedMessage, config.encryptionKey)) as { text: string }).text;
    const resetToken = new URL(text.match(/Reset your password at: (\S+)/)![1]!).searchParams.get('token')!;
    expect((await post('/auth/password/reset', { token: resetToken, password: 'UpdatedStaffPassword43!', confirmPassword: 'UpdatedStaffPassword43!' })).statusCode).toBe(200);
    expect((await post('/auth/login/complete', { challengeToken: token, code })).statusCode).toBe(401);
    expect(await prisma.authSession.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.loginChallenge.count({ where: { userId: user.id, consumedAt: null } })).toBe(0);
    // A password-verified request paused before session or challenge issuance cannot
    // commit after a reset: both issuance paths recheck the old credential under lock.
    const repository = createPrismaAuthRepository(prisma);
    await expect(repository.createLoginChallenge({ id: randomUUID(), userId: user.id, tokenHash: randomUUID(), purpose: 'LOGIN_MFA', expiresAt: new Date(Date.now() + 60000), expectedPasswordHash: oldHash })).rejects.toThrow();
    await expect(repository.createSession({ sessionId: randomUUID(), userId: user.id, tokenHash: randomUUID(), familyId: randomUUID(), refreshToken: randomUUID(), refreshExpiresAt: new Date(Date.now() + 60000), mfaAt: new Date(), deviceLabel: null, expectedPasswordHash: oldHash })).rejects.toThrow();
    expect(await prisma.authSession.count({ where: { userId: user.id } })).toBe(0);
  });
});
