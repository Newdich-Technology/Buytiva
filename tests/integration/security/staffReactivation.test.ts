import { afterAll, beforeAll, describe, expect, it } from 'vitest';
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
import { encryptSecret } from '../../../src/lib/security/secretBox.js';
import { signAccessToken } from '../../../src/lib/security/tokenSigner.js';
import { AUTH_TOKEN_ISSUER } from '../../../src/constants/auths/auth.constants.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const url = process.env.AUTH_TEST_DATABASE_URL;
const config = { tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000', otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000',
  encryptionKey: Buffer.alloc(32, 53), publicBaseUrl: 'https://buytiva.example', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };
(url ? describe : describe.skip)('staff reactivation HTTP security', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  const ids: string[] = [];
  const hasher = new Argon2PasswordHasher();
  beforeAll(async () => {
    if (process.env.BUYTIVA_DISPOSABLE_TEST_DB !== '1' || url !== process.env.DATABASE_URL || new URL(url!).pathname !== '/buytiva_test') throw new Error('Requires explicitly disposable buytiva_test database.');
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) });
    const deps: AuthDependencies = { config, repository: createPrismaAuthRepository(prisma), identityRepository: new PrismaProcurerApplicationRepository(prisma),
      staffRepository: new PrismaStaffInvitationRepository(prisma), passwordHasher: hasher, emailProvider: new MemoryEmailProvider() };
    app = createBuytivaFastifyApplication({ authDependencies: deps });
    await app.ready();
  });
  afterAll(async () => {
    if (!prisma) return;
    await app?.close();
    await prisma.refreshToken.deleteMany({ where: { session: { userId: { in: ids } } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: ids } } });
    await prisma.loginChallenge.deleteMany({ where: { userId: { in: ids } } });
    await prisma.mfaFactor.deleteMany({ where: { userId: { in: ids } } });
    await prisma.userPermissionGrant.deleteMany({ where: { userId: { in: ids } } });
    await prisma.staffProfile.deleteMany({ where: { userId: { in: ids } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: ids } } });
    await prisma.credential.deleteMany({ where: { userId: { in: ids } } });
    await prisma.auditLog.deleteMany({ where: { OR: [{ actorId: { in: ids } }, { resourceId: { in: ids } }] } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });
  async function session(userId: string, mfaAt: Date | null) {
    const record = await prisma.authSession.create({ data: { userId, tokenHash: randomUUID(), mfaVerifiedAt: mfaAt, expiresAt: new Date(Date.now() + 3600000) } });
    const now = Math.floor(Date.now() / 1000);
    const token = signAccessToken({ sub: userId, sid: record.id, iss: AUTH_TOKEN_ISSUER, iat: now, exp: now + 3600, auth_time: now, amr: ['pwd'] }, config.tokenSecret);
    return { id: record.id, headers: { authorization: `Bearer ${token}` } };
  }
  it('requires recent super-admin MFA and revokes multi-role sessions before restoring staff access', async () => {
    const ownerEmail = `${randomUUID()}@example.test`, targetEmail = `${randomUUID()}@example.test`;
    const owner = await prisma.user.create({ data: { email: ownerEmail, emailNormalized: ownerEmail, emailVerifiedAt: new Date(),
      roleAssignments: { create: { role: 'SUPER_ADMIN' } }, staffProfile: { create: { status: 'ACTIVE' } } } });
    ids.push(owner.id);
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    const target = await prisma.user.create({ data: { email: targetEmail, emailNormalized: targetEmail, emailVerifiedAt: new Date(),
      credential: { create: { passwordHash: await hasher.hashPassword('SecureStaffPassword42!') } },
      roleAssignments: { create: [{ role: 'CUSTOMER' }, { role: 'ADMIN' }] }, staffProfile: { create: { status: 'SUSPENDED' } },
      mfaFactors: { create: { type: 'TOTP', enabledAt: new Date(), secretCiphertext: Buffer.from(encryptSecret(secret, config.encryptionKey)) } },
      permissionGrants: { create: { permission: 'procurerApplication.read' } } } });
    ids.push(target.id);
    const oldCustomer = await session(target.id, new Date());
    const ownerSession = await session(owner.id, new Date());
    const stale = await session(owner.id, new Date(Date.now() - 11 * 60000));
    const path = `/api/v1/super-admin/staff/${target.id}/reactivate`, payload = { reason: 'Verified identity and access restoration.' };
    const call = (headers: { authorization: string }) => app.inject({ method: 'POST', url: path, headers, payload });
    expect((await call(oldCustomer.headers)).statusCode).toBe(403);
    expect((await call(stale.headers)).statusCode).toBe(403);
    const decisions = await Promise.all([call(ownerSession.headers), call(ownerSession.headers)]);
    expect(decisions.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect((await prisma.staffProfile.findUniqueOrThrow({ where: { userId: target.id } })).status).toBe('ACTIVE');
    expect((await prisma.authSession.findUniqueOrThrow({ where: { id: oldCustomer.id } })).revokedReason).toBe('STAFF_REACTIVATED');
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: oldCustomer.headers })).statusCode).toBe(401);
    expect(await prisma.auditLog.count({ where: { actorId: owner.id, resourceId: target.id, action: 'STAFF_REACTIVATED' } })).toBe(1);
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: targetEmail, password: 'SecureStaffPassword42!' } });
    expect(login.json()).toMatchObject({ authenticationRequired: true, challengeType: 'LOGIN_MFA' });
    expect(login.body).not.toContain('accessToken');
  }, 30000);
});
