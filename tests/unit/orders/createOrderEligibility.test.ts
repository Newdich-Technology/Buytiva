import { describe, expect, it, vi } from 'vitest';
import { PrismaOrderRepository } from '../../../src/repositories/orders/order.repository.js';
import type { PrismaClient } from '../../../src/generated/prisma/client.js';

describe('order creation eligibility', () => {
  it('does not create an order if accepted-quote coverage or eligibility is no longer present', async () => {
    const create = vi.fn();
    const findZone = vi.fn().mockResolvedValue(null);
    const tx = { quotation: { findFirst: vi.fn().mockResolvedValue({ currency: 'NGN', requestId: 'request', request: {
      procurerId: 'procurer', addressSnapshot: { country: 'NG', region: 'fct', city: 'abuja', area: 'wuse' }
    } }) }, procurerServiceZone: { findFirst: findZone }, procurementOrder: { create } };
    const prisma = { $transaction: vi.fn((callback) => callback(tx)) } as unknown as PrismaClient;
    const repository = new PrismaOrderRepository(prisma);
    await expect(repository.create('customer', 'quote')).rejects.toMatchObject({ statusCode: 409 });
    expect(findZone).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({
      country: 'NG', region: 'fct', city: 'abuja', area: 'wuse', currency: 'NGN', active: true,
      profile: expect.objectContaining({ userId: 'procurer', status: 'ACTIVE', acceptingRequests: true })
    }) }));
    expect(create).not.toHaveBeenCalled();
  });
});
