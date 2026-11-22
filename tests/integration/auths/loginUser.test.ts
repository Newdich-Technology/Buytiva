import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StaffProfileStatus, UserRole, UserStatus } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';
import { Argon2PasswordHasher } from '../../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';
import * as OTPAuth from 'otpauth';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite('privileged login and first-login security', () => {
  const config = {
    tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000',
    otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000',
    encryptionKey: Buffer.alloc(32, 31),
    publicBaseUrl: 'https://buytiva.example',
    secureCookies: true,
    passwordMinLength: 12,
    passwordMaxLength: 128
  };
  const emailProvider = new MemoryEmailProvider();
  const passwordHasher = new Argon2PasswordHasher();
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
      passwordHasher,
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

  it('requires MFA and a mandatory password change before bootstrap staff access', async () => {
    const oldPassword = 'BootstrapStaffPassword42!';
    const user = await prisma.user.create({
      data: {
        email: 'bootstrap@example.com', emailNormalized: 'bootstrap@example.com', displayName: 'Bootstrap Staff',
        emailVerifiedAt: new Date(), status: UserStatus.ACTIVE,
        credential: { create: { passwordHash: await passwordHasher.hashPassword(oldPassword), mustChangePassword: true } },
        roleAssignments: { create: { role: UserRole.SUPER_ADMIN } },
        staffProfile: { create: { status: StaffProfileStatus.PENDING_SETUP } }
      }
    });
    expect(user.id).toBeTruthy();

    const unknown = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'missing@example.com', password: oldPassword } });
    const incorrect = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'bootstrap@example.com', password: 'IncorrectPassword42!' } });
    expect(unknown.statusCode).toBe(incorrect.statusCode);
    expect(unknown.json<{ error: { message: string } }>().error.message).toBe(incorrect.json<{ error: { message: string } }>().error.message);

    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'bootstrap@example.com', password: oldPassword } });
    const challenge = login.json<{ challengeType: string; challengeToken: string; passwordChangeRequired: boolean }>();
    expect(challenge).toMatchObject({ challengeType: 'MFA_ENROLLMENT', passwordChangeRequired: true });
    expect(login.body).not.toContain('accessToken');
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/login/complete', payload: { challengeToken: challenge.challengeToken, code: '000000' } })).statusCode).toBe(401);

    const enrollment = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/totp/enroll', payload: { challengeToken: challenge.challengeToken } });
    expect(enrollment.statusCode).toBe(200);
    const secret = enrollment.json<{ secret: string }>().secret;
    const code = createTotpCode(secret, user.email);
    const verified = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/totp/verify', payload: { challengeToken: challenge.challengeToken, code } });
    const session = verified.json<{ session: { accessToken: string } }>().session;
    expect(verified.statusCode).toBe(200);
    const bearer = { authorization: `Bearer ${session.accessToken}` };
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: bearer })).statusCode).toBe(403);

    const newPassword = 'UpdatedBootstrapPassword43!';
    const changed = await app.inject({ method: 'POST', url: '/api/v1/auth/password/change', headers: bearer, payload: { currentPassword: oldPassword, password: newPassword, confirmPassword: newPassword } });
    expect(changed.statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: bearer })).statusCode).toBe(401);
    const nextLogin = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'bootstrap@example.com', password: newPassword } });
    expect(nextLogin.json<{ challengeType: string; passwordChangeRequired: boolean }>()).toMatchObject({ challengeType: 'LOGIN_MFA', passwordChangeRequired: false });
  });
});

function createTotpCode(secret: string, email: string) {
  return new OTPAuth.TOTP({ issuer: 'BUYTIVA', label: email, algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) }).generate();
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
