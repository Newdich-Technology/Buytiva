import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';
import { PrismaProcurerServicesRepository } from '../../../src/repositories/procurerServices/procurerServices.repository.js';
import { Argon2PasswordHasher } from '../../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';
import { signAccessToken } from '../../../src/lib/security/tokenSigner.js';
import { AUTH_TOKEN_ISSUER } from '../../../src/constants/auths/auth.constants.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const secret = 'test-secret-long-enough-for-authentication';
(databaseUrl ? describe : describe.skip)('procurer services API', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  const users: string[] = [], applications: string[] = [];
  beforeAll(async () => {
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) });
    const config = { tokenSecret: secret, otpPepper: secret, encryptionKey: Buffer.alloc(32, 22), publicBaseUrl: 'https://example.test', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };
    const deps: AuthDependencies = { config, repository: createPrismaAuthRepository(prisma), identityRepository: new PrismaProcurerApplicationRepository(prisma), staffRepository: new PrismaStaffInvitationRepository(prisma), passwordHasher: new Argon2PasswordHasher(), emailProvider: new MemoryEmailProvider() };
    app = createBuytivaFastifyApplication({ authDependencies: deps, procurerServicesRepository: new PrismaProcurerServicesRepository(prisma) });
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
    await prisma.procurerServiceZone.deleteMany({ where: { profile: { userId: { in: users } } } });
    await prisma.accountInvitation.deleteMany({ where: { applicationId: { in: applications } } });
    await prisma.procurerProfile.deleteMany({ where: { userId: { in: users } } });
    await prisma.mfaFactor.deleteMany({ where: { userId: { in: users } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: users } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: users } } });
    await prisma.procurerApplication.deleteMany({ where: { id: { in: applications } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  });
  async function account(role: 'CUSTOMER' | 'PROCURER') {
    const id = randomUUID(); users.push(id); const email = `${id}@example.test`;
    await prisma.user.create({ data: { id, email, emailNormalized: email, emailVerifiedAt: new Date(), roleAssignments: { create: { role } } } });
    const session = await prisma.authSession.create({ data: { userId: id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 3600_000), mfaVerifiedAt: role === 'PROCURER' ? new Date() : null } });
    const now = Math.floor(Date.now() / 1000);
    return { id, email, headers: { authorization: `Bearer ${signAccessToken({ sub: id, sid: session.id, iss: AUTH_TOKEN_ISSUER, iat: now, exp: now + 3600, auth_time: now, amr: ['pwd'] }, secret)}` } };
  }
  async function approved(user: Awaited<ReturnType<typeof account>>) {
    const application = await prisma.procurerApplication.create({ data: { applicantEmail: user.email, applicantEmailNormalized: user.email,
      firstName: 'Test', lastName: 'Procurer', proposedCountry: 'NG', proposedCity: 'Abuja', categories: ['groceries'], consentAt: new Date(),
      status: 'APPROVED', emailVerifiedAt: new Date(), identityVerifiedAt: new Date(), complianceVerifiedAt: new Date() } });
    applications.push(application.id);
    await prisma.accountInvitation.create({ data: { kind: 'PROCURER', emailNormalized: user.email, displayName: 'Test', tokenHash: randomUUID(), applicationId: application.id, acceptedById: user.id, consumedAt: new Date(), expiresAt: new Date(Date.now() + 60_000) } });
    await prisma.procurerProfile.create({ data: { userId: user.id, applicationId: application.id, status: 'ACTIVE' } });
    await prisma.mfaFactor.create({ data: { userId: user.id, type: 'TOTP', secretCiphertext: Buffer.from('test'), enabledAt: new Date() } });
    return application;
  }
  it('limits configuration and discovery to active verified procurers and exact normalized locations', async () => {
    const customer = await account('CUSTOMER'), procurer = await account('PROCURER'), other = await account('PROCURER');
    const application = await approved(procurer); await approved(other);
    const profile = { publicName: 'Trusted Shop', biography: 'Groceries', acceptingRequests: true };
    const zone = { country: 'ng', region: ' FCT ', city: 'Abuja', area: 'Wuse 2', deliveryFeeMinor: '250000', currency: 'NGN', active: true };
    expect((await app.inject({ method: 'PUT', url: '/api/v1/procurer-services/me', headers: customer.headers, payload: profile })).statusCode).toBe(403);
    const attemptedEscalation = await app.inject({ method: 'PUT', url: '/api/v1/procurer-services/me', headers: procurer.headers, payload: { ...profile, status: 'SUSPENDED' } });
    expect(attemptedEscalation.statusCode).toBe(200);
    expect((await prisma.procurerProfile.findUniqueOrThrow({ where: { userId: procurer.id } })).status).toBe('ACTIVE');
    expect((await app.inject({ method: 'PUT', url: '/api/v1/procurer-services/me', headers: procurer.headers, payload: profile })).statusCode).toBe(200);
    const created = await app.inject({ method: 'POST', url: '/api/v1/procurer-services/me/zones', headers: procurer.headers, payload: zone });
    expect(created.statusCode).toBe(201);
    const id = created.json<{ id: string }>().id;
    expect((await app.inject({ method: 'POST', url: '/api/v1/procurer-services/me/zones', headers: procurer.headers, payload: zone })).statusCode).toBe(409);
    expect((await app.inject({ method: 'PUT', url: `/api/v1/procurer-services/me/zones/${id}`, headers: other.headers, payload: zone })).statusCode).toBe(403);
    const url = '/api/v1/procurers/discovery?country=NG&region=fct&city=ABUJA&area=wuse%202';
    const discover = () => app.inject({ method: 'GET', url, headers: customer.headers });
    expect((await discover()).json()).toMatchObject([{ userId: procurer.id, publicName: 'Trusted Shop', zone: { deliveryFeeMinor: '250000' } }]);
    expect((await app.inject({ method: 'GET', url: url.replace('wuse%202', 'wuse'), headers: customer.headers })).json()).toEqual([]);
    await prisma.procurerApplication.update({ where: { id: application.id }, data: { complianceVerifiedAt: null } });
    expect((await discover()).json()).toEqual([]);
    expect((await app.inject({ method: 'PUT', url: '/api/v1/procurer-services/me', headers: procurer.headers, payload: profile })).statusCode).toBe(403);
    await prisma.procurerApplication.update({ where: { id: application.id }, data: { complianceVerifiedAt: new Date() } });
    await prisma.accountInvitation.updateMany({ where: { applicationId: application.id }, data: { acceptedById: other.id } });
    expect((await discover()).json()).toEqual([]);
    await prisma.accountInvitation.updateMany({ where: { applicationId: application.id }, data: { acceptedById: procurer.id } });
    await prisma.user.update({ where: { id: procurer.id }, data: { status: 'SUSPENDED' } });
    expect((await discover()).json()).toEqual([]);
    expect((await app.inject({ method: 'GET', url: '/api/v1/procurer-services/me', headers: procurer.headers })).statusCode).toBe(401);
  });
});
