import { OutboxStatus, PrismaClient } from '../../generated/prisma/client.js';
import { AUTH_EMAIL_OUTBOX_TYPES, AUTH_OUTBOX_MAX_ATTEMPTS, AUTH_OUTBOX_RETRY_BASE_MS, AUTH_OUTBOX_RETRY_MAX_MS } from '../../constants/auths/auth.constants.js';

export interface ClaimedOutboxEvent {
  readonly id: string;
  readonly eventType: string;
  readonly payload: unknown;
  readonly claimToken: string;
  readonly attempts: number;
}

export class PrismaOutboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async claimNextEvent(now: Date, claimToken: string): Promise<ClaimedOutboxEvent | null> {
    return this.prisma.$transaction(async (tx) => {
      const candidate = await tx.outboxEvent.findFirst({
        where: { status: OutboxStatus.PENDING, availableAt: { lte: now }, eventType: { in: [...AUTH_EMAIL_OUTBOX_TYPES] } },
        orderBy: { createdAt: 'asc' }
      });
      if (!candidate) return null;
      const claimed = await tx.outboxEvent.updateMany({
        where: { id: candidate.id, status: OutboxStatus.PENDING, availableAt: { lte: now }, eventType: { in: [...AUTH_EMAIL_OUTBOX_TYPES] } },
        data: { status: OutboxStatus.PROCESSING, claimedAt: now, claimToken, attempts: { increment: 1 } }
      });
      if (claimed.count !== 1) return null;
      const event = await tx.outboxEvent.findUnique({ where: { id: candidate.id } });
      if (!event) return null;
      return { id: event.id, eventType: event.eventType, payload: event.payload, claimToken, attempts: event.attempts };
    });
  }

  async completeEvent(id: string, claimToken: string, now: Date): Promise<void> {
    await this.prisma.outboxEvent.updateMany({
      where: { id, claimToken, status: OutboxStatus.PROCESSING },
      data: { status: OutboxStatus.COMPLETED, processedAt: now, claimToken: null, claimedAt: null, payload: {} }
    });
  }

  async failEvent(id: string, claimToken: string, attempts: number, now: Date): Promise<void> {
    const terminal = attempts >= AUTH_OUTBOX_MAX_ATTEMPTS;
    const delayMilliseconds = Math.min(AUTH_OUTBOX_RETRY_BASE_MS * 2 ** Math.min(attempts, 6), AUTH_OUTBOX_RETRY_MAX_MS);
    await this.prisma.outboxEvent.updateMany({
      where: { id, claimToken, status: OutboxStatus.PROCESSING },
      data: {
        status: terminal ? OutboxStatus.FAILED : OutboxStatus.PENDING,
        availableAt: new Date(now.getTime() + delayMilliseconds),
        claimToken: null,
        claimedAt: null,
        lastErrorCode: 'EMAIL_DELIVERY_FAILED'
      }
    });
  }
}
