import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { PrismaStaffInvitationRepository } from '../../../src/repositories/administrators/staffInvitation.repository.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
(databaseUrl ? describe : describe.skip)('last super administrator protection', () => {
  let prisma: PrismaClient;
  beforeAll(() => { prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) }); });
  afterAll(async () => { await prisma.$disconnect(); });
  it('does not remove the final active super administrator under concurrent changes', async () => {
    const ids: string[] = [];
    try {
      for (let i = 0; i < 2; i++) {
        const email = `${randomUUID()}@example.invalid`;
        const user = await prisma.user.create({ data: { email, emailNormalized: email, emailVerifiedAt: new Date(),
          roleAssignments: { create: { role: 'SUPER_ADMIN' } }, staffProfile: { create: { status: 'ACTIVE' } } } });
        ids.push(user.id);
      }
      const before = await prisma.roleAssignment.count({ where: { role: 'SUPER_ADMIN', revokedAt: null, user: { status: 'ACTIVE', staffProfile: { is: { status: 'ACTIVE' } } } } });
      const repo = new PrismaStaffInvitationRepository(prisma);
      const outcomes = await Promise.all(ids.map((id) => repo.suspendStaff({ userId: id, actorId: id, reason: 'Concurrent security test', now: new Date() })));
      const after = await prisma.roleAssignment.count({ where: { role: 'SUPER_ADMIN', revokedAt: null, user: { status: 'ACTIVE', staffProfile: { is: { status: 'ACTIVE' } } } } });
      expect(after).toBeGreaterThanOrEqual(1);
      expect(after).toBe(before - outcomes.filter(Boolean).length);
      if (before === 2) expect(outcomes.filter(Boolean)).toHaveLength(1);
    } finally {
      await prisma.auditLog.deleteMany({ where: { actorId: { in: ids } } });
      await prisma.staffProfile.deleteMany({ where: { userId: { in: ids } } });
      await prisma.roleAssignment.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
  });
});
