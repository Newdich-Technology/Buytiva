import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaProcurerServicesRepository } from '../../../src/repositories/procurerServices/procurerServices.repository.js';

describe('discovery pagination', () => {
  it('counts only eligible invitation owners, across database batches', async () => {
    const rows = Array.from({ length: 102 }, (_, index) => ({ id: `zone-${index}`, country: 'NG', region: 'fct', city: 'abuja', area: 'wuse',
      currency: 'NGN', active: true, deliveryFeeMinor: 1n, profile: { userId: `user-${index}`, publicName: `Name ${index}`, biography: null,
        application: { accountInvitations: [{ acceptedById: index < 100 ? 'different-user' : `user-${index}` }] },
        pricingPolicies: [{ id: 'policy', version: 1, currency: 'NGN', fixedFeeMinor: 1n, thresholdMinor: 1n, percentageBasisPoints: 1, createdAt: new Date() }] } }));
    const findMany = vi.fn(async (args: { skip: number; take: number }) => rows.slice(args.skip, args.skip + args.take));
    const prisma = { $transaction: vi.fn(async (callback) => callback({ procurerServiceZone: { findMany } })) } as unknown as PrismaClient;
    const repo = new PrismaProcurerServicesRepository(prisma);
    const result = await repo.discover({ country: 'NG', region: 'fct', city: 'abuja', area: 'wuse', offset: 1, limit: 1 });
    expect(result.map((row) => row.userId)).toEqual(['user-101']);
    expect(findMany).toHaveBeenCalledTimes(2);
  });
});
