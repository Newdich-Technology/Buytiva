import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { createPrismaAuthRepository } from '../../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';
import { PrismaShoppingListRepository } from '../../../src/repositories/shoppingLists/shoppingList.repository.js';
import { Argon2PasswordHasher } from '../../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';
import { signAccessToken } from '../../../src/lib/security/tokenSigner.js';
import { AUTH_TOKEN_ISSUER } from '../../../src/constants/auths/auth.constants.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;
const secret = 'test-secret-long-enough-for-authentication';

suite('shopping lists API with PostgreSQL', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  const users: string[] = [];
  const config = { tokenSecret: secret, otpPepper: secret, encryptionKey: Buffer.alloc(32, 22), publicBaseUrl: 'https://example.test', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };
  beforeAll(async () => {
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) });
    const dependencies: AuthDependencies = { config, repository: createPrismaAuthRepository(prisma), identityRepository: new PrismaProcurerApplicationRepository(prisma), staffRepository: new PrismaStaffInvitationRepository(prisma), passwordHasher: new Argon2PasswordHasher(), emailProvider: new MemoryEmailProvider() };
    app = createBuytivaFastifyApplication({ authDependencies: dependencies, shoppingListRepository: new PrismaShoppingListRepository(prisma) });
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
    await prisma.shoppingList.deleteMany({ where: { customerId: { in: users } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: users } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: users } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  });
  async function customer() {
    const id = randomUUID(); users.push(id);
    await prisma.user.create({ data: { id, email: `${id}@example.test`, emailNormalized: `${id}@example.test`, emailVerifiedAt: new Date(), roleAssignments: { create: { role: 'CUSTOMER' } } } });
    const session = await prisma.authSession.create({ data: { userId: id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 3600_000) } });
    const now = Math.floor(Date.now() / 1000);
    const token = signAccessToken({ sub: id, sid: session.id, iss: AUTH_TOKEN_ISSUER, iat: now, exp: now + 3600, auth_time: now, amr: ['pwd'] }, secret);
    return { id, headers: { authorization: `Bearer ${token}` } };
  }

  it('enforces ownership, validates items, and atomically submits a draft', async () => {
    const a = await customer(), b = await customer();
    expect((await app.inject({ method: 'GET', url: '/api/v1/shopping-lists' })).statusCode).toBe(401);
    const created = await app.inject({ method: 'POST', url: '/api/v1/shopping-lists', headers: a.headers, payload: { title: 'Groceries', currency: 'NGN' } });
    expect(created.statusCode).toBe(201);
    const id = created.json<{ id: string }>().id;
    const path = `/api/v1/shopping-lists/${id}`;
    expect((await app.inject({ method: 'GET', url: path, headers: b.headers })).statusCode).toBe(404);
    expect((await app.inject({ method: 'POST', url: `${path}/items`, headers: b.headers, payload: { name: 'Rice', quantity: '1', expectedUnitPriceMinor: '200' } })).statusCode).toBe(404);
    expect((await app.inject({ method: 'POST', url: `${path}/submit`, headers: a.headers })).statusCode).toBe(400);
    expect((await prisma.shoppingList.findUniqueOrThrow({ where: { id } })).revision).toBe(0);
    expect((await app.inject({ method: 'POST', url: `${path}/items`, headers: a.headers, payload: { name: 'Rice', quantity: '-1', expectedUnitPriceMinor: '200' } })).statusCode).toBe(400);
    const added = await app.inject({ method: 'POST', url: `${path}/items`, headers: a.headers, payload: { name: 'Rice', quantity: '1.125', expectedUnitPriceMinor: '9007199254740993', notes: 'Brown' } });
    expect(added.statusCode).toBe(200);
    const item = added.json<{ items: { id: string; quantity: string; expectedUnitPriceMinor: string }[] }>().items[0]!;
    expect(item).toMatchObject({ quantity: '1.125', expectedUnitPriceMinor: '9007199254740993' });
    expect((await app.inject({ method: 'PUT', url: `${path}/items/${item.id}`, headers: a.headers, payload: { name: 'Rice', quantity: '2', expectedUnitPriceMinor: '250' } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/shopping-lists?limit=1&offset=0', headers: a.headers })).json()).toHaveLength(1);
    const attempts = await Promise.all([1, 2].map(() => app.inject({ method: 'POST', url: `${path}/submit`, headers: a.headers })));
    expect(attempts.map((response) => response.statusCode).sort()).toEqual([200, 404]);
    expect((await app.inject({ method: 'DELETE', url: path, headers: a.headers })).statusCode).toBe(404);
    expect((await app.inject({ method: 'DELETE', url: `${path}/items/${item.id}`, headers: a.headers })).statusCode).toBe(404);
    await prisma.user.update({ where: { id: a.id }, data: { status: 'SUSPENDED' } });
    expect((await app.inject({ method: 'GET', url: path, headers: a.headers })).statusCode).toBe(401);
  });
});
