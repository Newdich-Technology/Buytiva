import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import pino from 'pino';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { AUTH_OUTBOX_LEASE_MS, AUTH_OUTBOX_MAX_ATTEMPTS } from '../../../src/constants/auths/auth.constants.js';
import { PrismaOutboxRepository } from '../../../src/repositories/outbox/outbox.repository.js';
import { ProcessAuthEmailOutboxJob } from '../../../src/jobs/workers/processAuthEmailOutbox.job.js';
import { getAuthConfig } from '../../../src/configs/auth.config.js';
import { encryptSecret } from '../../../src/lib/security/secretBox.js';
import { MemoryEmailProvider } from '../../../src/lib/email/emailSender.js';

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
(databaseUrl ? describe : describe.skip)('authentication email outbox', () => {
  let prisma: PrismaClient;
  let repository: PrismaOutboxRepository;
  const ids: string[] = [];
  const config = getAuthConfig({ AUTH_TOKEN_SECRET: 'a'.repeat(32), AUTH_OTP_PEPPER: 'b'.repeat(32), AUTH_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64') });
  beforeAll(() => {
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl! }) });
    repository = new PrismaOutboxRepository(prisma);
  });
  afterAll(async () => {
    await prisma.outboxEvent.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });
  async function createEvent(data: { status?: 'PENDING' | 'PROCESSING'; attempts?: number; claimedAt?: Date; claimToken?: string } = {}) {
    const id = randomUUID(); ids.push(id);
    return prisma.outboxEvent.create({ data: { id, eventType: 'AUTH_EMAIL_VERIFICATION', aggregateType: 'test', aggregateId: id,
      dedupeKey: id, createdAt: new Date(0), payload: { encryptedMessage: encryptSecret(JSON.stringify({ to: 'person@example.invalid', subject: 'Verify', text: 'Secret code 123456' }), config.encryptionKey) }, ...data } });
  }
  it('recovers a stale lease once, fences stale workers, and stops after the maximum attempts', async () => {
    const now = new Date();
    const event = await createEvent({ status: 'PROCESSING', attempts: 1, claimedAt: new Date(now.getTime() - AUTH_OUTBOX_LEASE_MS - 1), claimToken: randomUUID() });
    const results = await Promise.all([repository.claimNextEvent(now, randomUUID()), repository.claimNextEvent(now, randomUUID())]);
    const claimed = results.find((item) => item?.id === event.id);
    expect(results.filter((item) => item?.id === event.id)).toHaveLength(1);
    expect(claimed?.attempts).toBe(2);
    await repository.completeEvent(event.id, event.claimToken!, now);
    await repository.failEvent(event.id, event.claimToken!, 1, now);
    expect((await prisma.outboxEvent.findUniqueOrThrow({ where: { id: event.id } })).claimToken).toBe(claimed!.claimToken);
    await repository.completeEvent(event.id, claimed!.claimToken, now);
    expect(await prisma.outboxEvent.findUniqueOrThrow({ where: { id: event.id } })).toMatchObject({ status: 'COMPLETED', payload: {}, attempts: 2 });
    const historical = new Date('2001-01-01T00:00:00Z');
    const exhausted = await createEvent({ status: 'PROCESSING', attempts: AUTH_OUTBOX_MAX_ATTEMPTS, claimedAt: new Date(historical.getTime() - AUTH_OUTBOX_LEASE_MS - 1), claimToken: randomUUID() });
    const other = await repository.claimNextEvent(historical, randomUUID());
    expect(other?.id).not.toBe(exhausted.id);
    expect(other).toBeNull();
    expect(await prisma.outboxEvent.findUniqueOrThrow({ where: { id: exhausted.id } })).toMatchObject({ status: 'FAILED', claimToken: null, lastErrorCode: 'EMAIL_CLAIM_EXPIRED' });
  });
  it('retries failures with backoff, never logs provider errors or secrets, and clears delivered payload', async () => {
    const event = await createEvent();
    const provider = new MemoryEmailProvider();
    const send = vi.spyOn(provider, 'sendEmail').mockRejectedValueOnce(new Error('Secret code 123456 provider credentials'));
    const logger = pino({ enabled: false });
    const warn = vi.spyOn(logger, 'warn');
    const worker = new ProcessAuthEmailOutboxJob(repository, provider, config, logger);
    expect(await worker.runOnce()).toBe(true);
    const failed = await prisma.outboxEvent.findUniqueOrThrow({ where: { id: event.id } });
    expect(failed).toMatchObject({ status: 'PENDING', attempts: 1, lastErrorCode: 'EMAIL_DELIVERY_FAILED' });
    expect(failed.availableAt.getTime()).toBeGreaterThan(Date.now());
    expect(JSON.stringify(warn.mock.calls)).not.toContain('123456');
    await prisma.outboxEvent.update({ where: { id: event.id }, data: { availableAt: new Date(0) } });
    expect(await worker.runOnce()).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
    expect(provider.messages).toHaveLength(1);
    expect(await prisma.outboxEvent.findUniqueOrThrow({ where: { id: event.id } })).toMatchObject({ status: 'COMPLETED', attempts: 2, payload: {} });
  });
});
