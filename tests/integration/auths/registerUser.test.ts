import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
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

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite('customer authentication integration', () => {
  const config = {
    tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000',
    otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000',
    encryptionKey: Buffer.alloc(32, 29),
    publicBaseUrl: 'https://buytiva.example',
    secureCookies: true,
    passwordMinLength: 12,
    passwordMaxLength: 128
  };
  const emailProvider = new MemoryEmailProvider();
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;

  beforeAll(async () => {
    process.env.AUTH_TOKEN_SECRET = config.tokenSecret;
    process.env.AUTH_OTP_PEPPER = config.otpPepper;
    process.env.AUTH_ENCRYPTION_KEY = config.encryptionKey.toString('base64');
    process.env.PUBLIC_APP_URL = config.publicBaseUrl;
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) });
    const dependencies: AuthDependencies = {
      config,
      repository: createPrismaAuthRepository(prisma),
      identityRepository: new PrismaProcurerApplicationRepository(prisma),
      staffRepository: new PrismaStaffInvitationRepository(prisma),
      passwordHasher: new Argon2PasswordHasher(),
      emailProvider
    };
    app = createBuytivaFastifyApplication({ authDependencies: dependencies });
    await app.ready();
  });

  beforeEach(async () => {
    await clearAuthenticationRecords(prisma);
    emailProvider.messages.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('verifies customers once, rotates refresh tokens, and invalidates sessions on logout', async () => {
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: createRegistrationBody() });
    expect(registration.statusCode).toBe(202);
    expect(registration.json<{ accepted: boolean }>().accepted).toBe(true);
    const verification = await getVerificationDetails(prisma, config);
    const attempts = await Promise.all([
      verifyEmail(app, verification.challengeId, verification.code),
      verifyEmail(app, verification.challengeId, verification.code)
    ]);
    expect(attempts.map((response) => response.statusCode).sort()).toEqual([200, 401]);

    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'customer@example.com', password: 'SecureCustomerPass42!' } });
    expect(login.statusCode).toBe(200);
    const session = login.json<{ authenticationRequired: boolean; session: { accessToken: string; refreshToken: string } }>().session;
    const rotated = await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload: { refreshToken: session.refreshToken } });
    expect(rotated.statusCode).toBe(200);
    const newSession = rotated.json<{ accessToken: string; refreshToken: string }>();
    expect(newSession.refreshToken).not.toBe(session.refreshToken);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: `Bearer ${newSession.accessToken}` } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload: { refreshToken: session.refreshToken } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: `Bearer ${newSession.accessToken}` } })).statusCode).toBe(401);

    const secondLogin = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'customer@example.com', password: 'SecureCustomerPass42!' } });
    const secondSession = secondLogin.json<{ session: { accessToken: string } }>().session;
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { authorization: `Bearer ${secondSession.accessToken}` } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: `Bearer ${secondSession.accessToken}` } })).statusCode).toBe(401);
  });

  it('rejects refresh for a suspended account and revokes the session', async () => {
    await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: createRegistrationBody() });
    const verification = await getVerificationDetails(prisma, config);
    expect((await verifyEmail(app, verification.challengeId, verification.code)).statusCode).toBe(200);
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'customer@example.com', password: 'SecureCustomerPass42!' } });
    const session = login.json<{ session: { refreshToken: string; accessToken: string } }>().session;
    const user = await prisma.user.update({ where: { emailNormalized: 'customer@example.com' }, data: { status: 'SUSPENDED' } });
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload: { refreshToken: session.refreshToken } });
    expect(response.statusCode).toBe(401);
    expect(await prisma.authSession.count({ where: { userId: user.id, revokedAt: null } })).toBe(0);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: `Bearer ${session.accessToken}` } })).statusCode).toBe(401);
  });

  it('keeps registration and recovery responses generic and consumes password reset tokens once', async () => {
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: createRegistrationBody('recovery@example.com') });
    expect(registration.statusCode).toBe(202);
    const duplicate = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: createRegistrationBody('recovery@example.com') });
    expect(duplicate.statusCode).toBe(registration.statusCode);
    expect(duplicate.body).toBe(registration.body);
    const verification = await getVerificationDetails(prisma, config);
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/email-otp/verify', payload: { email: 'recovery@example.com', challengeId: verification.challengeId, code: verification.code } })).statusCode).toBe(200);

    const known = await app.inject({ method: 'POST', url: '/api/v1/auth/password/forgot', payload: { email: 'recovery@example.com' } });
    const unknown = await app.inject({ method: 'POST', url: '/api/v1/auth/password/forgot', payload: { email: 'missing@example.com' } });
    expect([known.statusCode, known.body]).toEqual([unknown.statusCode, unknown.body]);
    const resetUrl = await getPasswordResetUrl(prisma, config);
    const token = new URL(resetUrl).searchParams.get('token') ?? '';
    const payload = { token, password: 'NewCustomerPassword43!', confirmPassword: 'NewCustomerPassword43!' };
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/password/reset', payload })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/password/reset', payload })).statusCode).toBe(401);
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'recovery@example.com', password: 'SecureCustomerPass42!' } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'recovery@example.com', password: payload.password } })).statusCode).toBe(200);
  });
});

function createRegistrationBody(email = 'customer@example.com') {
  return { email, displayName: 'Customer Example', password: 'SecureCustomerPass42!', termsAccepted: true };
}

async function verifyEmail(app: ReturnType<typeof createBuytivaFastifyApplication>, challengeId: string, code: string) {
  return app.inject({ method: 'POST', url: '/api/v1/auth/email-otp/verify', payload: { email: 'customer@example.com', challengeId, code } });
}

async function getVerificationDetails(prisma: PrismaClient, config: { encryptionKey: Buffer }) {
  const event = await prisma.outboxEvent.findFirstOrThrow({ where: { eventType: 'AUTH_EMAIL_VERIFICATION' }, orderBy: { createdAt: 'desc' } });
  const payload = event.payload as { encryptedMessage: string };
  const message = JSON.parse(decryptSecret(payload.encryptedMessage, config.encryptionKey)) as { text: string };
  return { challengeId: message.text.match(/Challenge reference: ([0-9a-f-]+)/)?.[1] ?? '', code: message.text.match(/verification code is ([0-9]{6})/)?.[1] ?? '' };
}

async function getPasswordResetUrl(prisma: PrismaClient, config: { encryptionKey: Buffer }) {
  const event = await prisma.outboxEvent.findFirstOrThrow({ where: { eventType: 'AUTH_PASSWORD_RESET' }, orderBy: { createdAt: 'desc' } });
  const payload = event.payload as { encryptedMessage: string };
  const message = JSON.parse(decryptSecret(payload.encryptedMessage, config.encryptionKey)) as { text: string };
  return message.text.match(/Reset your password at: (\S+)/)?.[1] ?? '';
}

async function clearAuthenticationRecords(prisma: PrismaClient) {
  await prisma.refreshToken.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.emailOtpChallenge.deleteMany();
  await prisma.loginChallenge.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.accountInvitation.deleteMany();
  await prisma.procurerInvitationToken.deleteMany();
  await prisma.procurerApplicationStatusHistory.deleteMany();
  await prisma.procurerApplicationVerificationToken.deleteMany();
  await prisma.userPermissionGrant.deleteMany();
  await prisma.procurerProfile.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.mfaFactor.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.procurerApplication.deleteMany();
  await prisma.user.deleteMany();
}
