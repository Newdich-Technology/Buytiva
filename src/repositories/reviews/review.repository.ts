import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { OrderReview } from '../../generated/prisma/client.js';
import type { ReviewRepository } from '../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput } from '../../models/reviews/review.model.js';
import { conflictError } from '../../errors/auths/auth.error.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';

function view(row: OrderReview) {
  return { id: row.id, orderId: row.orderId, rating: row.rating, comment: row.comment,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
const unavailable = () => new AppError(ErrorCode.NOT_FOUND, 404, 'Order or review not found.');
export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}
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
