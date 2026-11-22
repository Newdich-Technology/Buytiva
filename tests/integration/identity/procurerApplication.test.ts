import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole as PrismaUserRole, StaffProfileStatus } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { getAuthConfig } from '../../../src/configs/auth.config.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';
import { Argon2PasswordHasher } from '../../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';
import { decryptSecret } from '../../../src/lib/security/secretBox.js';
import { issueAuthenticatedSession } from '../../../src/lib/security/sessionIssuer.js';
import { hashOneTimeToken } from '../../../src/lib/security/oneTimeToken.js';
import { UserRole } from '../../../src/enums/userRole.enum.js';
import { UserStatus } from '../../../src/enums/userStatus.enum.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';
import * as OTPAuth from 'otpauth';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite('procurer application and invitation security', () => {
  const config = getTestAuthConfig();
  const emailProvider = new MemoryEmailProvider();
  let prisma: PrismaClient;
  let dependencies: AuthDependencies;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;

  beforeAll(async () => {
    process.env.AUTH_TOKEN_SECRET = config.tokenSecret;
    process.env.AUTH_OTP_PEPPER = config.otpPepper;
    process.env.AUTH_ENCRYPTION_KEY = config.encryptionKey.toString('base64');
    process.env.PUBLIC_APP_URL = config.publicBaseUrl;
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) });
    dependencies = {
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

  it('verifies application email, protects status lookup, reviews only with permissions, and consumes invitation once', async () => {
    const submission = await app.inject({ method: 'POST', url: '/api/v1/procurer-applications', payload: createApplicationBody() });
    expect(submission.statusCode).toBe(202);
    const submitted = submission.json<{ challengeId: string; reference: string }>();
    expect(submitted.reference).toMatch(/^BT-P-[A-F0-9]{32}$/);
    const verificationCode = await getOutboxCode(prisma, config, 'AUTH_EMAIL_VERIFICATION', 'verification code is');
    const verified = await app.inject({ method: 'POST', url: '/api/v1/procurer-applications/email/verify', payload: { email: 'Procurer@example.com', challengeId: submitted.challengeId, code: verificationCode } });
    expect(verified.statusCode).toBe(200);
    const replay = await app.inject({ method: 'POST', url: '/api/v1/procurer-applications/email/verify', payload: { email: 'procurer@example.com', challengeId: submitted.challengeId, code: verificationCode } });
    expect(replay.statusCode).toBe(401);

    const lookup = await app.inject({ method: 'POST', url: '/api/v1/procurer-applications/status/request', payload: { email: 'procurer@example.com', reference: submitted.reference } });
    expect(lookup.statusCode).toBe(202);
    const lookupCode = await getOutboxCode(prisma, config, 'AUTH_APPLICATION_STATUS', 'one-time application status verification code is');
    const statusResult = await app.inject({ method: 'POST', url: '/api/v1/procurer-applications/status/verify', payload: { email: 'procurer@example.com', challengeId: lookup.json<{ challengeId: string }>().challengeId, code: lookupCode } });
    expect(statusResult.json<{ status: string }>().status).toBe('UNDER_REVIEW');

    const reviewer = await createStaffSession(prisma, dependencies, 'reviewer@example.com', UserRole.ADMIN, ['procurerApplication.review']);
    const application = await prisma.procurerApplication.findUniqueOrThrow({ where: { publicReference: submitted.reference } });
    const checks = await app.inject({ method: 'POST', url: `/api/v1/admin/procurer-applications/${application.id}/identity-checks`, headers: { authorization: 'Bearer ' + reviewer.accessToken }, payload: { identityEvidenceReference: 'evidence-identity-reference-001', complianceEvidenceReference: 'evidence-compliance-reference-001' } });
    expect(checks.statusCode).toBe(200);
    const approval = await app.inject({ method: 'POST', url: `/api/v1/admin/procurer-applications/${application.id}/approve`, headers: { authorization: 'Bearer ' + reviewer.accessToken }, payload: { reason: 'Identity and compliance documents reviewed.' } });
    expect(approval.statusCode).toBe(200);
    expect(approval.body).not.toContain('/invite/');

    const invitation = await getOutboxText(prisma, config, 'AUTH_INVITATION', 'Complete setup at:');
    const invitationLink = invitation.split('Complete setup at: ')[1];
    expect(invitationLink).toBeTruthy();
    const token = new URL(invitationLink ?? '').pathname.split('/').at(-1) ?? '';
    expect(token).toBeTruthy();
    const preview = await app.inject({ method: 'POST', url: '/api/v1/invitations/preview', payload: { token } });
    expect(preview.json<{ kind: string }>().kind).toBe('PROCURER');
    const acceptanceAttempts = await Promise.all([
      app.inject({ method: 'POST', url: '/api/v1/invitations/accept', payload: { token, password: 'SecureProcurerPass42!', confirmPassword: 'SecureProcurerPass42!' } }),
      app.inject({ method: 'POST', url: '/api/v1/invitations/accept', payload: { token, password: 'SecureProcurerPass42!', confirmPassword: 'SecureProcurerPass42!' } })
    ]);
    expect(acceptanceAttempts.map((response) => response.statusCode).sort()).toEqual([200, 401]);
    const accepted = acceptanceAttempts.find((response) => response.statusCode === 200)!;
    expect(accepted.json<{ profileStatus: string }>().profileStatus).toBe('PENDING_SETUP');
    expect((await app.inject({ method: 'POST', url: '/api/v1/invitations/accept', payload: { token, password: 'SecureProcurerPass42!', confirmPassword: 'SecureProcurerPass42!' } })).statusCode).toBe(401);

    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'procurer@example.com', password: 'SecureProcurerPass42!' } });
    const loginChallenge = login.json<{ authenticationRequired: boolean; challengeType: string; challengeToken: string }>();
    expect(loginChallenge.authenticationRequired).toBe(true);
    expect(loginChallenge.challengeType).toBe('MFA_ENROLLMENT');
    expect(login.body).not.toContain('accessToken');
    const enrollment = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/totp/enroll', payload: { challengeToken: loginChallenge.challengeToken } });
    expect(enrollment.statusCode).toBe(200);
    const totpSecret = enrollment.json<{ secret: string }>().secret;
    const code = new OTPAuth.TOTP({ issuer: 'BUYTIVA', label: 'procurer@example.com', algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(totpSecret) }).generate();
    const completed = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/totp/verify', payload: { challengeToken: loginChallenge.challengeToken, code } });
    expect(completed.statusCode).toBe(200);
    const invitedUser = await prisma.user.findUniqueOrThrow({ where: { emailNormalized: 'procurer@example.com' } });
    expect((await prisma.procurerProfile.findUniqueOrThrow({ where: { userId: invitedUser.id } })).status).toBe('ACTIVE');
  });

  it('does not let an administrator invite staff or approve without the review permission', async () => {
    const applicationResponse = await app.inject({ method: 'POST', url: '/api/v1/procurer-applications', payload: createApplicationBody('unauthorized@example.com') });
    const reference = applicationResponse.json<{ reference: string }>().reference;
    const admin = await createStaffSession(prisma, dependencies, 'limited@example.com', UserRole.ADMIN, []);
    const invite = await app.inject({ method: 'POST', url: '/api/v1/super-admin/staff/invite-admin', headers: { authorization: 'Bearer ' + admin.accessToken }, payload: { email: 'new-admin@example.com', displayName: 'New Admin', reason: 'Cover application reviews.' } });
    expect(invite.statusCode).toBe(403);
    const application = await prisma.procurerApplication.findUniqueOrThrow({ where: { publicReference: reference } });
    const approval = await app.inject({ method: 'POST', url: `/api/v1/admin/procurer-applications/${application.id}/approve`, headers: { authorization: 'Bearer ' + admin.accessToken }, payload: { reason: 'Unauthorized attempt.' } });
    expect(approval.statusCode).toBe(403);
  });

  it('restricts staff invitations to super administrators and enforces last-super-admin protection', async () => {
    const owner = await createStaffSession(prisma, dependencies, 'owner@example.com', UserRole.SUPER_ADMIN, []);
    const invite = await app.inject({ method: 'POST', url: '/api/v1/super-admin/staff/invite-admin', headers: { authorization: 'Bearer ' + owner.accessToken }, payload: { email: 'reviewer@example.com', displayName: 'Application Reviewer', reason: 'Assign review coverage.', permissionProfile: 'APPLICATION_REVIEWER' } });
    expect(invite.statusCode).toBe(202);
    expect(invite.body).not.toContain('/invite/');
    const invitation = await getOutboxText(prisma, config, 'AUTH_INVITATION', 'Complete setup at:');
    const invitationLink = invitation.split('Complete setup at: ')[1];
    expect(invitationLink).toBeTruthy();
    const token = new URL(invitationLink ?? '').pathname.split('/').at(-1) ?? '';
    expect(token).toBeTruthy();
    const acceptanceAttempts = await Promise.all([
      app.inject({ method: 'POST', url: '/api/v1/invitations/accept', payload: { token, password: 'SecureStaffPass42!', confirmPassword: 'SecureStaffPass42!' } }),
      app.inject({ method: 'POST', url: '/api/v1/invitations/accept', payload: { token, password: 'SecureStaffPass42!', confirmPassword: 'SecureStaffPass42!' } })
    ]);
    expect(acceptanceAttempts.map((response) => response.statusCode).sort()).toEqual([200, 429]);
    const staffUser = await prisma.user.findUniqueOrThrow({ where: { emailNormalized: 'reviewer@example.com' }, include: { roleAssignments: true, permissionGrants: true, staffProfile: true } });
    expect(staffUser.roleAssignments.map((role) => role.role)).toContain('ADMIN');
    expect(staffUser.permissionGrants.map((grant) => grant.permission)).toEqual(['procurerApplication.read', 'procurerApplication.review']);
    expect(staffUser.staffProfile?.status).toBe('PENDING_SETUP');
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'reviewer@example.com', password: 'SecureStaffPass42!' } });
    expect(login.json<{ challengeType: string }>().challengeType).toBe('MFA_ENROLLMENT');
    const revokeOwner = await app.inject({ method: 'POST', url: '/api/v1/super-admin/staff/' + owner.user.id + '/revoke', headers: { authorization: 'Bearer ' + owner.accessToken }, payload: { reason: 'Attempted removal of final owner.' } });
    expect(revokeOwner.statusCode).toBe(409);

    const expiringInvite = await app.inject({ method: 'POST', url: '/api/v1/super-admin/staff/invite-admin', headers: { authorization: 'Bearer ' + owner.accessToken }, payload: { email: 'expired@example.com', displayName: 'Expired Admin', reason: 'Prepare a short-term administration account.' } });
    expect(expiringInvite.statusCode).toBe(202);
    const expiringMessage = await getOutboxText(prisma, config, 'AUTH_INVITATION', 'Complete setup at:');
    const expiringLink = expiringMessage.split('Complete setup at: ')[1] ?? '';
    const expiringToken = new URL(expiringLink).pathname.split('/').at(-1) ?? '';
    await prisma.accountInvitation.update({ where: { tokenHash: hashOneTimeToken(expiringToken) }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await app.inject({ method: 'POST', url: '/api/v1/invitations/preview', payload: { token: expiringToken } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'POST', url: '/api/v1/invitations/accept', payload: { token: expiringToken, password: 'ExpiredStaffPass42!', confirmPassword: 'ExpiredStaffPass42!' } })).statusCode).toBe(429);
  });
});

function getTestAuthConfig() {
  const encryptionKey = Buffer.alloc(32, 23);
  return { tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000', otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000', encryptionKey, publicBaseUrl: 'https://buytiva.example', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };
}

function createApplicationBody(email = 'Procurer@example.com') {
  return { email, firstName: 'Ada', lastName: 'Adeyemi', phone: '+2348000000000', proposedCountry: 'Nigeria', proposedRegion: 'Lagos', proposedCity: 'Lagos', proposedArea: 'Ikeja', categories: ['Groceries'], experience: 'Experienced procurer.', consentAccepted: true };
}

async function createStaffSession(prisma: PrismaClient, dependencies: AuthDependencies, email: string, role: UserRole, permissions: string[]) {
  const user = await prisma.user.create({ data: { email, emailNormalized: email, displayName: email, emailVerifiedAt: new Date(), status: 'ACTIVE', roleAssignments: { create: { role: role as unknown as PrismaUserRole } }, staffProfile: { create: { status: StaffProfileStatus.ACTIVE } }, permissionGrants: { create: permissions.map((permission) => ({ permission })) } } });
  const account = { id: user.id, email, emailNormalized: email, displayName: email, emailVerifiedAt: user.emailVerifiedAt, status: UserStatus.ACTIVE, passwordHash: null, mustChangePassword: false, roles: [role], mfaSecret: null, lastAcceptedTimeStep: null, staffStatus: 'ACTIVE', procurerStatus: null };
  return { ...(await issueAuthenticatedSession(dependencies.repository, dependencies.config, account, new Date(), 'integration test')), user };
}

async function getOutboxText(prisma: PrismaClient, config: ReturnType<typeof getTestAuthConfig>, eventType: string, textNeedle: string) {
  const records = await prisma.outboxEvent.findMany({ where: { eventType }, orderBy: { createdAt: 'desc' } });
  let emailText: string | undefined;
  for (const record of records) {
    const payload = record.payload as { encryptedMessage?: string };
    if (!payload.encryptedMessage) continue;
    const message = JSON.parse(decryptSecret(payload.encryptedMessage, config.encryptionKey)) as { text: string };
    if (message.text.includes(textNeedle)) {
      emailText = message.text;
      break;
    }
  }
  expect(emailText).toBeTruthy();
  return emailText ?? '';
}

async function getOutboxCode(prisma: PrismaClient, config: ReturnType<typeof getTestAuthConfig>, eventType: string, textNeedle: string) {
  const message = await getOutboxText(prisma, config, eventType, textNeedle);
  const code = message.match(/code is ([0-9]{6})/)?.[1];
  expect(code).toBeTruthy();
  return code ?? '';
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
