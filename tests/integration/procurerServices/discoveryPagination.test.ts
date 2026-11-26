import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaProcurerServicesRepository } from '../../../src/repositories/procurerServices/procurerServices.repository.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
(databaseUrl ? describe : describe.skip)('discovery eligibility pagination on PostgreSQL', () => {
  let prisma: PrismaClient;
  const users: string[] = [], applications: string[] = [];
  beforeAll(() => { prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) }); });
  afterAll(async () => {
    await prisma.procurerPricingPolicy.deleteMany({ where: { profile: { userId: { in: users } } } });
    await prisma.procurerServiceZone.deleteMany({ where: { profile: { userId: { in: users } } } });
    await prisma.accountInvitation.deleteMany({ where: { applicationId: { in: applications } } });
    await prisma.procurerProfile.deleteMany({ where: { userId: { in: users } } });
    await prisma.mfaFactor.deleteMany({ where: { userId: { in: users } } });
    await prisma.roleAssignment.deleteMany({ where: { userId: { in: users } } });
    await prisma.procurerApplication.deleteMany({ where: { id: { in: applications } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  });
  async function makeProcurer(name: string, acceptedBy?: string) {
    const id = randomUUID(); users.push(id); const email = `${id}@example.test`;
    await prisma.user.create({ data: { id, email, emailNormalized: email, emailVerifiedAt: new Date(), roleAssignments: { create: { role: 'PROCURER' } },
      mfaFactors: { create: { type: 'TOTP', secretCiphertext: Buffer.from('test'), enabledAt: new Date() } } } });
    const application = await prisma.procurerApplication.create({ data: { applicantEmail: email, applicantEmailNormalized: email,
      firstName: 'Test', lastName: 'Procurer', proposedCountry: 'NG', proposedCity: 'Abuja', categories: ['groceries'], consentAt: new Date(),
      status: 'APPROVED', emailVerifiedAt: new Date(), identityVerifiedAt: new Date(), complianceVerifiedAt: new Date() } });
    applications.push(application.id);
    await prisma.accountInvitation.create({ data: { kind: 'PROCURER', emailNormalized: email, displayName: name, tokenHash: randomUUID(),
      applicationId: application.id, acceptedById: acceptedBy ?? id, consumedAt: new Date(), expiresAt: new Date(Date.now() + 60000) } });
    const profile = await prisma.procurerProfile.create({ data: { userId: id, applicationId: application.id, status: 'ACTIVE', acceptingRequests: true, publicName: name } });
    await prisma.procurerServiceZone.create({ data: { profileId: profile.id, country: 'NG', region: 'fct', city: 'abuja', area: 'wuse', currency: 'NGN', deliveryFeeMinor: 10n, active: true } });
    await prisma.procurerPricingPolicy.create({ data: { profileId: profile.id, version: 1, currency: 'NGN', fixedFeeMinor: 10n, thresholdMinor: 1000n, percentageBasisPoints: 100 } });
    return id;
  }
  it('paginates after filtering out mismatched invitation owners', async () => {
    const first = await makeProcurer('Audit B');
    await makeProcurer('Audit A', first);
    const second = await makeProcurer('Audit C');
    const repository = new PrismaProcurerServicesRepository(prisma);
    const query = { country: 'NG', region: 'fct', city: 'abuja', area: 'wuse', offset: 0, limit: 1 };
    expect((await repository.discover(query)).map((row) => row.userId)).toEqual([first]);
    expect((await repository.discover({ ...query, offset: 1 })).map((row) => row.userId)).toEqual([second]);
    expect(await repository.discover({ ...query, offset: 2 })).toEqual([]);
  });
});
