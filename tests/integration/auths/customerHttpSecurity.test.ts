import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';
import { Argon2PasswordHasher } from '../../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';
import { decryptSecret } from '../../../src/lib/security/secretBox.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const url = process.env.AUTH_TEST_DATABASE_URL;
const config = { tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000', otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000',
  encryptionKey: Buffer.alloc(32, 31), publicBaseUrl: 'https://buytiva.example', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };
const password = 'SecureCustomerPass42!';
(url ? describe : describe.skip)('customer HTTP security with isolated PostgreSQL records', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  let diagnostic: unknown;
  const userIds: string[] = [];
  const hasher = new Argon2PasswordHasher();
  beforeAll(() => {
    if (process.env.BUYTIVA_DISPOSABLE_TEST_DB !== '1' || url !== process.env.DATABASE_URL || new URL(url!).pathname !== '/buytiva_test') throw new Error('Requires explicitly disposable buytiva_test database.');
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) });
  });
  beforeEach(async () => {
    const deps: AuthDependencies = { config, repository: createPrismaAuthRepository(prisma), identityRepository: new PrismaProcurerApplicationRepository(prisma),
      staffRepository: new PrismaStaffInvitationRepository(prisma), passwordHasher: hasher, emailProvider: new MemoryEmailProvider() };
    const original = deps.repository.requestPasswordReset.bind(deps.repository);
    deps.repository.requestPasswordReset = async (...args) => { try { return await original(...args); } catch (e) { diagnostic = e; throw e; } };
    app = createBuytivaFastifyApplication({ authDependencies: deps });
    await app.ready();
  });
  afterEach(async () => { await app.close(); });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.refreshToken.deleteMany({ where: { session: { userId: { in: userIds } } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.emailOtpChallenge.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.credential.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.auditLog.deleteMany({ where: { resourceId: { in: userIds } } });
    await prisma.outboxEvent.deleteMany({ where: { aggregateId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });
  const post = (path: string, payload: object) => app.inject({ method: 'POST', url: `/api/v1${path}`, payload });
  const getMe = (token: string) => app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: `Bearer ${token}` } });
  async function registered() {
    const email = `${randomUUID()}@example.test`;
    const body = { email, displayName: 'Customer', password, termsAccepted: true };
    const responses = await Promise.all([post('/auth/register', body), post('/auth/register', { ...body, email: email.toUpperCase() })]);
    expect(responses.map((r) => r.statusCode)).toEqual([202, 202]);
    expect(responses[0]!.body).toEqual(responses[1]!.body);
    const users = await prisma.user.findMany({ where: { emailNormalized: email } });
    expect(users).toHaveLength(1); userIds.push(users[0]!.id);
    return { email, userId: users[0]!.id };
  }
  async function verification(userId: string) {
    const event = await prisma.outboxEvent.findFirstOrThrow({ where: { aggregateId: userId, eventType: 'AUTH_EMAIL_VERIFICATION' }, orderBy: { createdAt: 'desc' } });
    const text = (JSON.parse(decryptSecret((event.payload as { encryptedMessage: string }).encryptedMessage, config.encryptionKey)) as { text: string }).text;
    return { challengeId: text.match(/Challenge reference: ([0-9a-f-]+)/)![1]!, code: text.match(/verification code is ([0-9]{6})/)![1]! };
  }
  it('enforces expiry and atomically supersedes an old challenge under concurrent resend', async () => {
    const { email, userId } = await registered();
    const first = await verification(userId);
    expect((await post('/auth/login', { email, password })).statusCode).not.toBe(200);
    await prisma.emailOtpChallenge.update({ where: { id: first.challengeId }, data: { expiresAt: new Date(Date.now() - 1000), resendAt: new Date(Date.now() - 1000) } });
    expect((await post('/auth/email-otp/verify', { email, ...first })).statusCode).toBe(401);
    const resend = await Promise.all([post('/auth/email-otp/resend', { email }), post('/auth/email-otp/resend', { email })]);
    expect(resend.map((r) => r.statusCode)).toEqual([202, 202]);
    expect(resend[0]!.body).toEqual(resend[1]!.body);
    const challenges = await prisma.emailOtpChallenge.findMany({ where: { userId, supersededAt: null, consumedAt: null } });
    expect(challenges).toHaveLength(1);
    const latest = await verification(userId);
    expect(latest.challengeId).not.toEqual(first.challengeId);
    expect((await post('/auth/email-otp/verify', { email, ...first })).statusCode).toBe(401);
    const verified = await Promise.all([post('/auth/email-otp/verify', { email, ...latest }), post('/auth/email-otp/verify', { email, ...latest })]);
    expect(verified.map((r) => r.statusCode).sort()).toEqual([200, 401]);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).emailVerifiedAt).not.toBeNull();
  });
  it('limits concurrent reset issuance and consumes a reset token once', async () => {
    const { email, userId } = await registered();
    const challenge = await verification(userId);
    expect((await post('/auth/email-otp/verify', { email, ...challenge })).statusCode).toBe(200);
    const login = await post('/auth/login', { email, password });
    const session = login.json<{ session: { accessToken: string } }>().session;
    const requests = await Promise.all([post('/auth/password/forgot', { email }), post('/auth/password/forgot', { email })]);
    expect(requests.map((r) => r.statusCode), JSON.stringify(diagnostic, Object.getOwnPropertyNames(diagnostic ?? {}))).toEqual([202, 202]);
    expect(requests[0]!.body).toEqual(requests[1]!.body);
    expect(await prisma.passwordResetToken.count({ where: { userId, consumedAt: null } })).toBe(1);
    const event = await prisma.outboxEvent.findFirstOrThrow({ where: { aggregateId: userId, eventType: 'AUTH_PASSWORD_RESET' }, orderBy: { createdAt: 'desc' } });
    const text = (JSON.parse(decryptSecret((event.payload as { encryptedMessage: string }).encryptedMessage, config.encryptionKey)) as { text: string }).text;
    const token = new URL(text.match(/Reset your password at: (\S+)/)![1]!).searchParams.get('token')!;
    const payload = { token, password: 'NewCustomerPassword43!', confirmPassword: 'NewCustomerPassword43!' };
    const attempts = await Promise.all([post('/auth/password/reset', payload), post('/auth/password/reset', payload)]);
    expect(attempts.map((r) => r.statusCode).sort()).toEqual([200, 401]);
    expect((await getMe(session.accessToken)).statusCode).toBe(401);
    expect((await post('/auth/login', { email, password })).statusCode).toBe(401);
    expect((await post('/auth/login', { email, password: payload.password })).statusCode).toBe(200);
  });
  it('isolates device revocation and rejects expired database sessions', async () => {
    const { email, userId } = await registered();
    const challenge = await verification(userId);
    expect((await post('/auth/email-otp/verify', { email, ...challenge })).statusCode).toBe(200);
    const login = async (deviceLabel: string) => (await post('/auth/login', { email, password, deviceLabel })).json<{ session: { accessToken: string; refreshToken: string } }>().session;
    const first = await login('first device'), second = await login('second device');
    const headers = { authorization: `Bearer ${first.accessToken}` };
    const sessions = (await app.inject({ method: 'GET', url: '/api/v1/auth/sessions', headers })).json<{ id: string; deviceLabel: string }[]>();
    expect(sessions).toHaveLength(2);
    const other = sessions.find((s) => s.deviceLabel === 'second device')!;
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/auth/sessions/${other.id}`, headers })).statusCode).toBe(200);
    expect((await getMe(second.accessToken)).statusCode).toBe(401);
    expect((await post('/auth/refresh', { refreshToken: second.refreshToken })).statusCode).toBe(401);
    expect((await getMe(first.accessToken)).statusCode).toBe(200);
    await prisma.authSession.updateMany({ where: { userId, revokedAt: null }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await getMe(first.accessToken)).statusCode).toBe(401);
    expect((await post('/auth/refresh', { refreshToken: first.refreshToken })).statusCode).toBe(401);
  });
});
