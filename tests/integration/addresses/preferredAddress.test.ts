import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaAddressRepository } from '../../../src/repositories/addresses/address.repository.js';
import { PrismaProcurerServicesRepository } from '../../../src/repositories/procurerServices/procurerServices.repository.js';
import { signAccessToken } from '../../../src/lib/security/tokenSigner.js';
import { AUTH_TOKEN_ISSUER } from '../../../src/constants/auths/auth.constants.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const secret = 'isolated-address-test-secret-at-least-32-characters';
(databaseUrl ? describe : describe.skip)('preferred address API on PostgreSQL', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  const users: string[] = [];
  beforeAll(async () => {
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) });
    const deps = { config: { tokenSecret: secret }, repository: createPrismaAuthRepository(prisma) } as AuthDependencies;
    app = createBuytivaFastifyApplication({ authDependencies: deps, addressRepository: new PrismaAddressRepository(prisma), procurerServicesRepository: new PrismaProcurerServicesRepository(prisma) });
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
    await prisma.customerAddress.deleteMany({ where: { customerId: { in: users } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: users } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: users } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  });
  async function customer() {
    const id = randomUUID(); users.push(id);
    await prisma.user.create({ data: { id, email: `${id}@example.test`, emailNormalized: `${id}@example.test`, emailVerifiedAt: new Date(), roleAssignments: { create: { role: 'CUSTOMER' } } } });
    const session = await prisma.authSession.create({ data: { userId: id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 3600000) } });
    const now = Math.floor(Date.now() / 1000);
    const token = signAccessToken({ sub: id, sid: session.id, iss: AUTH_TOKEN_ISSUER, iat: now, exp: now + 3600, auth_time: now, amr: ['pwd'] }, secret);
    return { id, headers: { authorization: `Bearer ${token}` } };
  }
  it('updates only the authenticated active customer profile', async () => {
    const a = await customer(), b = await customer();
    expect((await app.inject({ method: 'PATCH', url: '/api/v1/me', payload: { displayName: 'No Auth' } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'PATCH', url: '/api/v1/me', headers: a.headers, payload: { displayName: '  New Name  ', roles: ['SUPER_ADMIN'] } })).statusCode).toBe(400);
    expect((await app.inject({ method: 'PATCH', url: '/api/v1/me', headers: a.headers, payload: { displayName: '  ' } })).statusCode).toBe(400);
    const updated = await app.inject({ method: 'PATCH', url: '/api/v1/me', headers: a.headers, payload: { displayName: '  New Name  ' } });
    expect(updated.json()).toEqual({ displayName: 'New Name' });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: a.id } })).displayName).toBe('New Name');
    expect((await prisma.user.findUniqueOrThrow({ where: { id: b.id } })).displayName).toBeNull();
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: a.headers })).json()).toMatchObject({ displayName: 'New Name' });
    await prisma.roleAssignment.updateMany({ where: { userId: a.id }, data: { revokedAt: new Date() } });
    expect((await app.inject({ method: 'PATCH', url: '/api/v1/me', headers: a.headers, payload: { displayName: 'Other Name' } })).statusCode).toBe(403);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: a.id } })).displayName).toBe('New Name');
  });
  it('enforces ownership, atomic selection and clears a deleted preference', async () => {
    const a = await customer(), b = await customer();
    const body = { label: 'Home', line1: '123 Example Street', line2: null, country: 'NG', region: 'FCT', city: 'Abuja', area: 'Wuse' };
    const make = async (label: string) => (await app.inject({ method: 'POST', url: '/api/v1/addresses', headers: a.headers, payload: { ...body, label } })).json<{ id: string }>().id;
    const first = await make('Home'), second = await make('Work');
    expect((await app.inject({ method: 'GET', url: '/api/v1/addresses/preferred' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/addresses/preferred', headers: a.headers })).json()).toBeNull();
    expect((await app.inject({ method: 'PUT', url: `/api/v1/addresses/${first}/preferred`, headers: b.headers })).statusCode).toBe(404);
    await expect(prisma.customerPreferredAddress.create({ data: { customerId: b.id, addressId: first } })).rejects.toThrow();
    const choices = await Promise.all([first, second].map((id) => app.inject({ method: 'PUT', url: `/api/v1/addresses/${id}/preferred`, headers: a.headers })));
    expect(choices.map((x) => x.statusCode).every((x) => x === 200 || x === 409)).toBe(true);
    expect(choices.some((x) => x.statusCode === 200)).toBe(true);
    expect(await prisma.customerPreferredAddress.count({ where: { customerId: a.id } })).toBe(1);
    const selected = await app.inject({ method: 'PUT', url: `/api/v1/addresses/${second}/preferred`, headers: a.headers });
    expect(selected.statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/addresses/preferred', headers: a.headers })).json()).toMatchObject({ id: second, label: 'Work' });
    expect((await app.inject({ method: 'GET', url: '/api/v1/addresses/preferred', headers: b.headers })).json()).toBeNull();
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/addresses/${second}`, headers: a.headers })).statusCode).toBe(200);
    expect(await prisma.customerPreferredAddress.findUnique({ where: { customerId: a.id } })).toBeNull();
    expect((await app.inject({ method: 'GET', url: '/api/v1/addresses/preferred', headers: a.headers })).json()).toBeNull();
  });
});
