import { createReviewReport, listReviewReports, decideReviewReport } from './reviewReport.repository.js';
import { summarizeRatings } from '../../utils/reviews/ratingSummary.js';
import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { OrderReview } from '../../generated/prisma/client.js';
import type { ReviewRepository } from '../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput, ReviewDecision, RatingSummary, ReviewReportDecision } from '../../models/reviews/review.model.js';
import { conflictError } from '../../errors/auths/auth.error.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';

function view(row: OrderReview) {
  return { id: row.id, orderId: row.orderId, rating: row.rating, comment: row.comment, version: row.version,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
const unavailable = () => new AppError(ErrorCode.NOT_FOUND, 404, 'Order or review not found.');
export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}
  report(customerId: string, orderId: string, version: number, reason: string) { return createReviewReport(this.prisma, customerId, orderId, version, reason); }
  listReports(actorId: string, offset: number, limit: number) { return listReviewReports(this.prisma, actorId, offset, limit); }
  decideReport(actorId: string, reportId: string, decision: ReviewReportDecision) { return decideReviewReport(this.prisma, actorId, reportId, decision); }
  async ratingSummary(procurerId: string): Promise<RatingSummary> {
    return this.prisma.$transaction(async (tx) => {
      const distribution = { one: 0, two: 0, three: 0, four: 0, five: 0 };
      const keys = ['one', 'two', 'three', 'four', 'five'] as const;
      let cursor: string | undefined;
      const now = new Date();
      while (true) {
        const reviews = await tx.orderReview.findMany({ where: { moderationStatus: 'APPROVED', order: { status: 'COMPLETED', request: { procurerId } } },
          include: { order: { include: { request: true, quotation: true, payment: true, history: { where: { toStatus: 'COMPLETED' } } } } },
          orderBy: { id: 'asc' }, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), take: 100 });
        cursor = reviews.at(-1)?.id;
        for (const review of reviews) {
          const order = review.order, payment = order.payment;
          if (review.rating < 1 || review.rating > 5 || order.request.customerId === procurerId || !payment || payment.reversedAt || payment.verifiedAt > now ||
              payment.currency !== order.quotation.currency || payment.amountMinor !== order.quotation.totalMinor ||
              !order.history.some((entry) => entry.actorId === order.request.customerId)) continue;
          distribution[keys[review.rating - 1]!]++;
        }
        if (reviews.length < 100) break;
      }
      return summarizeRatings(distribution);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }
  async listForModeration(actorId: string, offset: number, limit: number) {
    const rows = await this.prisma.orderReview.findMany({ where: { order: { request: { customerId: { not: actorId }, procurerId: { not: actorId } } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: offset, take: limit });
    return rows.map((row) => ({ ...view(row), moderationStatus: row.moderationStatus }));
  }
  async moderate(actorId: string, reviewId: string, decision: ReviewDecision) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const where = { id: reviewId, order: { request: { customerId: { not: actorId }, procurerId: { not: actorId } } } };
        const existing = await tx.orderReview.findFirst({ where });
        if (!existing) throw unavailable();
        if (existing.version !== decision.expectedVersion || existing.moderationStatus !== decision.expectedStatus || existing.moderationStatus === decision.targetStatus) throw conflictError('Review state changed or decision is redundant.');
        const updated = await tx.orderReview.updateMany({ where: { ...where, version: decision.expectedVersion, moderationStatus: decision.expectedStatus }, data: { moderationStatus: decision.targetStatus } });
        if (!updated.count) throw conflictError('Review state changed; retry.');
        await tx.auditLog.create({ data: { actorId, action: 'REVIEW_MODERATED', resourceType: 'ORDER_REVIEW', resourceId: reviewId,
          metadata: { version: decision.expectedVersion, fromStatus: decision.expectedStatus, toStatus: decision.targetStatus, reason: decision.reason } } });
        const review = await tx.orderReview.findUniqueOrThrow({ where: { id: reviewId } });
        return { ...view(review), moderationStatus: review.moderationStatus };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw conflictError('Review state changed; retry.');
      throw error;
    }
  }
  async edit(customerId: string, orderId: string, expectedVersion: number, input: ReviewInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.procurementOrder.findFirst({ where: { id: orderId, request: { customerId } },
          include: { request: true, quotation: true, payment: true, history: { where: { toStatus: 'COMPLETED', actorId: customerId }, take: 1 }, review: true } });
        if (!order || !order.review) throw unavailable();
        const payment = order.payment;
        if (order.status !== 'COMPLETED' || order.request.procurerId === customerId || !order.history.length || !payment || payment.reversedAt ||
            payment.verifiedAt > new Date() || payment.currency !== order.quotation.currency || payment.amountMinor !== order.quotation.totalMinor ||
            order.review.moderationStatus === 'HIDDEN' || order.review.version !== expectedVersion) throw conflictError('Review cannot be edited or has changed.');
        const changed = await tx.orderReview.updateMany({ where: { id: order.review.id, version: expectedVersion, moderationStatus: { in: ['PENDING', 'APPROVED'] } },
          data: { rating: input.rating, comment: input.comment, version: { increment: 1 }, moderationStatus: 'PENDING' } });
        if (!changed.count) throw conflictError('Review has changed; retry.');
        await tx.auditLog.create({ data: { actorId: customerId, action: 'REVIEW_EDITED', resourceType: 'ORDER_REVIEW', resourceId: order.review.id,
          metadata: { fromVersion: expectedVersion, toVersion: expectedVersion + 1, fromStatus: order.review.moderationStatus, toStatus: 'PENDING' } } });
        return view(await tx.orderReview.findUniqueOrThrow({ where: { id: order.review.id } }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw conflictError('Review or order state changed; retry.');
      throw error;
    }
  }
  async create(customerId: string, orderId: string, input: ReviewInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.procurementOrder.findFirst({ where: { id: orderId, request: { customerId } },
          include: { request: true, quotation: true, payment: true, history: { where: { toStatus: 'COMPLETED', actorId: customerId }, take: 1 } } });
        if (!order) throw unavailable();
        const payment = order.payment;
        if (order.status !== 'COMPLETED' || order.request.procurerId === customerId || !order.history.length || !payment || payment.reversedAt ||
          payment.verifiedAt > new Date() || payment.currency !== order.quotation.currency || payment.amountMinor !== order.quotation.totalMinor) {
          throw conflictError('Order is not eligible for review.');
        }
        return view(await tx.orderReview.create({ data: { orderId, rating: input.rating, comment: input.comment } }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) throw conflictError('A review already exists or order state changed.');
      throw error;
    }
  }
  async getOwn(customerId: string, orderId: string) {
    const review = await this.prisma.orderReview.findFirst({ where: { orderId, order: { request: { customerId } } } });
    return review ? view(review) : null;
  }
}
