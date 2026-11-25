import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import * as OTPAuth from 'otpauth';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { createBuytivaFastifyApplication } from '../../src/app.js';
import { createPrismaAuthRepository } from '../../src/repositories/auths/auth.repository.js';
import { PrismaProcurerApplicationRepository } from '../../src/repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../../src/repositories/administrators/staffInvitation.repository.js';
import { PrismaAddressRepository } from '../../src/repositories/addresses/address.repository.js';
import { PrismaProcurerServicesRepository } from '../../src/repositories/procurerServices/procurerServices.repository.js';
import { PrismaShoppingListRepository } from '../../src/repositories/shoppingLists/shoppingList.repository.js';
import { PrismaShoppingRequestRepository } from '../../src/repositories/shoppingRequests/shoppingRequest.repository.js';
import { PrismaQuotationRepository } from '../../src/repositories/quotations/quotation.repository.js';
import { PrismaOrderRepository } from '../../src/repositories/orders/order.repository.js';
import { PrismaReviewRepository } from '../../src/repositories/reviews/review.repository.js';
import { Argon2PasswordHasher } from '../../src/lib/security/passwordHasher.js';
import { MemoryEmailProvider } from '../../src/lib/email/emailSender.js';
import { decryptSecret } from '../../src/lib/security/secretBox.js';
import { signAccessToken } from '../../src/lib/security/tokenSigner.js';
import { AUTH_TOKEN_ISSUER } from '../../src/constants/auths/auth.constants.js';
import type { AuthDependencies } from '../../src/types/authDependencies.type.js';

const url = process.env.AUTH_TEST_DATABASE_URL;
const run = url && process.env.BUYTIVA_DISPOSABLE_TEST_DB === '1';
const config = { tokenSecret: 'test-token-secret-with-enough-entropy-0000000000000000', otpPepper: 'test-otp-pepper-with-enough-entropy-000000000000000000',
  encryptionKey: Buffer.alloc(32, 23), publicBaseUrl: 'https://buytiva.example', secureCookies: true, passwordMinLength: 12, passwordMaxLength: 128 };

(run ? describe : describe.skip)('private review purchase journey on isolated PostgreSQL', () => {
  let prisma: PrismaClient;
  let app: ReturnType<typeof createBuytivaFastifyApplication>;
  beforeAll(async () => {
    // The cleanup below deletes test data. Never target a shared or production database.
    if (url !== process.env.DATABASE_URL || new URL(url!).pathname !== '/buytiva_test') throw new Error('Requires a dedicated buytiva_test database and explicit disposable opt-in.');
    process.env.PLATFORM_COMMISSION_POLICY_VERSION = 'e2e-test';
    process.env.PLATFORM_COMMISSION_BASIS_POINTS = '1000';
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) });
    const deps: AuthDependencies = { config, repository: createPrismaAuthRepository(prisma), identityRepository: new PrismaProcurerApplicationRepository(prisma),
      staffRepository: new PrismaStaffInvitationRepository(prisma), passwordHasher: new Argon2PasswordHasher(), emailProvider: new MemoryEmailProvider() };
    app = createBuytivaFastifyApplication({ authDependencies: deps, addressRepository: new PrismaAddressRepository(prisma),
      procurerServicesRepository: new PrismaProcurerServicesRepository(prisma), shoppingListRepository: new PrismaShoppingListRepository(prisma),
      shoppingRequestRepository: new PrismaShoppingRequestRepository(prisma), quotationRepository: new PrismaQuotationRepository(prisma),
      orderRepository: new PrismaOrderRepository(prisma), reviewRepository: new PrismaReviewRepository(prisma) });
    await app.ready();
  });
  afterAll(async () => {
    if (!app || !prisma) return;
    await app.close();
    await clean(prisma);
    await prisma.$disconnect();
    delete process.env.PLATFORM_COMMISSION_POLICY_VERSION;
    delete process.env.PLATFORM_COMMISSION_BASIS_POINTS;
  });
  async function post(path: string, payload?: object, token?: string) {
    return app.inject({ method: 'POST', url: `/api/v1${path}`, ...(payload ? { payload } : {}), ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}) });
  }
  async function text(eventType: string) {
    const event = await prisma.outboxEvent.findFirstOrThrow({ where: { eventType }, orderBy: { createdAt: 'desc' } });
    return (JSON.parse(decryptSecret((event.payload as { encryptedMessage: string }).encryptedMessage, config.encryptionKey)) as { text: string }).text;
  }
  it('registers, approves and activates a procurer, quotes, completes and privately reviews an order', async () => {
    const customerEmail = `${randomUUID()}@example.test`, procurerEmail = `${randomUUID()}@example.test`, password = 'SecureCustomerPass42!';
    expect((await post('/auth/register', { email: customerEmail, displayName: 'Customer', password, termsAccepted: true })).statusCode).toBe(202);
    const customerMessage = await text('AUTH_EMAIL_VERIFICATION');
    const customerChallenge = customerMessage.match(/Challenge reference: ([0-9a-f-]+)/)?.[1];
    const customerCode = customerMessage.match(/verification code is ([0-9]{6})/)?.[1];
    expect(customerChallenge && customerCode).toBeTruthy();
    expect((await post('/auth/email-otp/verify', { email: customerEmail, challengeId: customerChallenge, code: customerCode })).statusCode).toBe(200);
    const login = await post('/auth/login', { email: customerEmail, password });
    expect(login.statusCode).toBe(200);
    const customerToken = login.json<{ session: { accessToken: string } }>().session.accessToken;
    const submission = await post('/procurer-applications', { email: procurerEmail, firstName: 'Ada', lastName: 'Adeyemi', phone: '+2348000000000',
      proposedCountry: 'NG', proposedRegion: 'FCT', proposedCity: 'Abuja', proposedArea: 'Wuse', categories: ['Groceries'], consentAccepted: true });
    expect(submission.statusCode).toBe(202);
    const applicationMessage = await text('AUTH_EMAIL_VERIFICATION');
    const code = applicationMessage.match(/verification code is ([0-9]{6})/)?.[1];
    expect(code).toBeTruthy();
    expect((await post('/procurer-applications/email/verify', { email: procurerEmail, challengeId: submission.json<{ challengeId: string }>().challengeId, code })).statusCode).toBe(200);
    const reviewerId = randomUUID();
    await prisma.user.create({ data: { id: reviewerId, email: `${reviewerId}@example.test`, emailNormalized: `${reviewerId}@example.test`, emailVerifiedAt: new Date(),
      roleAssignments: { create: { role: 'ADMIN' } }, staffProfile: { create: { status: 'ACTIVE' } }, permissionGrants: { create: { permission: 'procurerApplication.review' } } } });
    const reviewerSession = await prisma.authSession.create({ data: { userId: reviewerId, tokenHash: randomUUID(), mfaVerifiedAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    const now = Math.floor(Date.now() / 1000);
    // An authenticated reviewer with MFA is a test fixture; application review is exercised through HTTP.
    const reviewerToken = signAccessToken({ sub: reviewerId, sid: reviewerSession.id, iss: AUTH_TOKEN_ISSUER, iat: now, exp: now + 3600, auth_time: now, amr: ['pwd'] }, config.tokenSecret);
    const application = await prisma.procurerApplication.findFirstOrThrow({ where: { applicantEmailNormalized: procurerEmail } });
    expect((await post(`/admin/procurer-applications/${application.id}/identity-checks`, { identityEvidenceReference: 'evidence-identity-reference-001', complianceEvidenceReference: 'evidence-compliance-reference-001' }, reviewerToken)).statusCode).toBe(200);
    expect((await post(`/admin/procurer-applications/${application.id}/approve`, { reason: 'Identity and compliance reviewed.' }, reviewerToken)).statusCode).toBe(200);
    const invitationMessage = await text('AUTH_INVITATION');
    const link = invitationMessage.split('Complete setup at: ')[1];
    expect(link).toBeTruthy();
    const invitationToken = new URL(link!).pathname.split('/').at(-1);
    expect((await post('/invitations/accept', { token: invitationToken, password, confirmPassword: password })).statusCode).toBe(200);
    const procurerLogin = await post('/auth/login', { email: procurerEmail, password });
    expect(procurerLogin.statusCode).toBe(200);
    const challengeToken = procurerLogin.json<{ challengeToken: string }>().challengeToken;
    const enroll = await post('/auth/mfa/totp/enroll', { challengeToken });
    expect(enroll.statusCode).toBe(200);
    const secret = enroll.json<{ secret: string }>().secret;
    const totp = new OTPAuth.TOTP({ issuer: 'BUYTIVA', label: procurerEmail, algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) }).generate();
    const activated = await post('/auth/mfa/totp/verify', { challengeToken, code: totp });
    expect(activated.statusCode).toBe(200);
    const procurerToken = activated.json<{ session: { accessToken: string } }>().session.accessToken;
    const procurer = await prisma.user.findUniqueOrThrow({ where: { emailNormalized: procurerEmail } });
    const procurerHeaders = { authorization: `Bearer ${procurerToken}` }, customerHeaders = { authorization: `Bearer ${customerToken}` };
    expect((await app.inject({ method: 'PUT', url: '/api/v1/procurer-services/me', headers: procurerHeaders, payload: { publicName: 'Trusted Shopper', biography: null, acceptingRequests: true } })).statusCode).toBe(200);
    expect((await post('/procurer-services/me/zones', { country: 'NG', region: 'FCT', city: 'Abuja', area: 'Wuse', currency: 'NGN', deliveryFeeMinor: '100', active: true }, procurerToken)).statusCode).toBe(201);
    expect((await app.inject({ method: 'PUT', url: '/api/v1/procurer-services/me/pricing', headers: procurerHeaders, payload: { currency: 'NGN', fixedFeeMinor: '100', thresholdMinor: '10000', percentageBasisPoints: 500, expectedVersion: 0 } })).statusCode).toBe(200);
    const address = await post('/addresses', { label: 'Home', line1: '123 Example Street', line2: null, country: 'NG', region: 'FCT', city: 'Abuja', area: 'Wuse' }, customerToken);
    expect(address.statusCode).toBe(201);
    const list = await post('/shopping-lists', { title: 'Groceries', currency: 'NGN' }, customerToken);
    expect(list.statusCode).toBe(201);
    const listId = list.json<{ id: string }>().id;
    expect((await post(`/shopping-lists/${listId}/items`, { name: 'Rice', quantity: '1', expectedUnitPriceMinor: '1000' }, customerToken)).statusCode).toBe(200);
    expect((await post(`/shopping-lists/${listId}/submit`, undefined, customerToken)).statusCode).toBe(200);
    const discovery = await app.inject({ method: 'GET', url: '/api/v1/procurers/discovery?country=NG&region=FCT&city=Abuja&area=Wuse', headers: customerHeaders });
    expect(discovery.json()).toMatchObject([{ userId: procurer.id }]);
    const request = await post('/shopping-requests', { listId, addressId: address.json<{ id: string }>().id, procurerId: procurer.id }, customerToken);
    expect(request.statusCode).toBe(201);
    const quote = await post(`/procurer-services/me/requests/${request.json<{ id: string }>().id}/quotations`, { expectedRevision: 0, expiresAt: new Date(Date.now() + 3600000).toISOString() }, procurerToken);
    expect(quote.statusCode).toBe(201);
    const quoteId = quote.json<{ id: string; totalMinor: string }>().id;
    expect((await post(`/quotations/${quoteId}/accept`, undefined, customerToken)).statusCode).toBe(200);
    const order = await post('/orders', { quotationId: quoteId }, customerToken);
    expect(order.statusCode).toBe(201);
    const orderId = order.json<{ id: string }>().id;
    const work = `/procurer-services/me/orders/${orderId}`, customerOrder = `/orders/${orderId}`;
    expect((await post(`${work}/start`, undefined, procurerToken)).statusCode).toBe(409);
    expect((await post(`${customerOrder}/review`, { rating: 5 }, customerToken)).statusCode).toBe(409);
    // Test-only database fixture; this is not a provider or production payment success.
    await prisma.verifiedOrderPayment.create({ data: { orderId, provider: 'isolated-e2e-fixture', providerReference: randomUUID(), currency: 'NGN', amountMinor: BigInt(quote.json<{ totalMinor: string }>().totalMinor), verifiedAt: new Date() } });
    expect((await post(`${work}/start`, undefined, procurerToken)).statusCode).toBe(200);
    expect((await post(`${work}/report-delivery`, undefined, procurerToken)).statusCode).toBe(200);
    expect((await post(`${customerOrder}/confirm-completion`, undefined, customerToken)).statusCode).toBe(200);
    const review = await post(`${customerOrder}/review`, { rating: 5, comment: 'Careful service.' }, customerToken);
    expect(review.statusCode).toBe(201);
    expect(await prisma.orderReview.count({ where: { orderId } })).toBe(1);
    expect((await app.inject({ method: 'GET', url: `/api/v1${customerOrder}/review`, headers: customerHeaders })).json()).toMatchObject({ rating: 5, comment: 'Careful service.' });
    expect((await post(`${customerOrder}/review`, { rating: 1 }, customerToken)).statusCode).toBe(409);
    const reviewId = review.json<{ id: string }>().id, moderate = `/admin/reviews/${reviewId}/moderate`;
    const decision = { expectedStatus: 'PENDING', targetStatus: 'APPROVED', reason: 'Checked against moderation rules.' };
    expect((await post(moderate, decision, customerToken)).statusCode).toBe(403);
    expect((await post(moderate, decision, reviewerToken)).statusCode).toBe(403);
    const customer = await prisma.user.findUniqueOrThrow({ where: { emailNormalized: customerEmail } });
    await prisma.staffProfile.create({ data: { userId: customer.id, status: 'ACTIVE' } });
    await prisma.roleAssignment.create({ data: { userId: customer.id, role: 'ADMIN' } });
    await prisma.userPermissionGrant.create({ data: { userId: customer.id, permission: 'reviews.moderate' } });
    await prisma.authSession.updateMany({ where: { userId: customer.id }, data: { mfaVerifiedAt: new Date() } });
    expect((await post(moderate, decision, customerToken)).statusCode).toBe(404);
    await prisma.userPermissionGrant.create({ data: { userId: reviewerId, permission: 'reviews.moderate' } });
    const moderationList = await app.inject({ method: 'GET', url: '/api/v1/admin/reviews?limit=1', headers: { authorization: `Bearer ${reviewerToken}` } });
    expect(moderationList.json()).toMatchObject([{ id: reviewId, moderationStatus: 'PENDING' }]);
    await prisma.authSession.update({ where: { id: reviewerSession.id }, data: { mfaVerifiedAt: new Date(Date.now() - 11 * 60000) } });
    expect((await post(moderate, decision, reviewerToken)).statusCode).toBe(403);
    await prisma.authSession.update({ where: { id: reviewerSession.id }, data: { mfaVerifiedAt: new Date() } });
    const approvals = await Promise.all([1, 2].map(() => post(moderate, decision, reviewerToken)));
    expect(approvals.map((response) => response.statusCode).sort()).toEqual([200, 409]);
    expect((await prisma.orderReview.findUniqueOrThrow({ where: { id: reviewId } })).moderationStatus).toBe('APPROVED');
    expect(await prisma.auditLog.count({ where: { actorId: reviewerId, action: 'REVIEW_MODERATED', resourceId: reviewId } })).toBe(1);
    expect((await post(moderate, { expectedStatus: 'APPROVED', targetStatus: 'HIDDEN', reason: 'Policy violation identified.' }, reviewerToken)).statusCode).toBe(200);
    expect((await post(moderate, { expectedStatus: 'HIDDEN', targetStatus: 'APPROVED', reason: 'Reinstated after review.' }, reviewerToken)).statusCode).toBe(200);
    expect(await prisma.auditLog.count({ where: { action: 'REVIEW_MODERATED', resourceId: reviewId } })).toBe(3);
  });
});

// Global cleanup is permitted only after the dedicated-database guard in beforeAll.
async function clean(prisma: PrismaClient) {
  await prisma.orderReview.deleteMany(); await prisma.procurementOrderHistory.deleteMany(); await prisma.verifiedOrderPayment.deleteMany();
  await prisma.procurementOrder.deleteMany(); await prisma.quotation.deleteMany(); await prisma.shoppingRequest.deleteMany();
  await prisma.shoppingList.deleteMany(); await prisma.customerAddress.deleteMany(); await prisma.procurerPricingPolicy.deleteMany(); await prisma.procurerServiceZone.deleteMany();
  await prisma.refreshToken.deleteMany(); await prisma.authSession.deleteMany(); await prisma.emailOtpChallenge.deleteMany(); await prisma.loginChallenge.deleteMany();
  await prisma.passwordResetToken.deleteMany(); await prisma.emailVerificationToken.deleteMany(); await prisma.accountInvitation.deleteMany(); await prisma.procurerInvitationToken.deleteMany();
  await prisma.procurerApplicationStatusHistory.deleteMany(); await prisma.procurerApplicationVerificationToken.deleteMany(); await prisma.userPermissionGrant.deleteMany();
  await prisma.procurerProfile.deleteMany(); await prisma.staffProfile.deleteMany(); await prisma.roleAssignment.deleteMany(); await prisma.credential.deleteMany(); await prisma.mfaFactor.deleteMany();
  await prisma.auditLog.deleteMany(); await prisma.outboxEvent.deleteMany(); await prisma.procurerApplication.deleteMany(); await prisma.user.deleteMany();
}
