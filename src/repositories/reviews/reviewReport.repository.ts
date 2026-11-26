import { Prisma, type PrismaClient, type ReviewReport } from '../../generated/prisma/client.js';
import type { ReviewReportDecision } from '../../models/reviews/review.model.js';
import { conflictError } from '../../errors/auths/auth.error.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';

const unavailable = () => new AppError(ErrorCode.NOT_FOUND, 404, 'Review or report not found.');
const view = (row: ReviewReport) => ({ id: row.id, reviewId: row.reviewId, reviewVersion: row.reviewVersion,
  ratingSnapshot: row.ratingSnapshot, commentSnapshot: row.commentSnapshot, reason: row.reason, status: row.status, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
const permitted = (actorId: string) => ({ reporterId: { not: actorId }, review: { order: { request: { customerId: { not: actorId }, procurerId: { not: actorId } } } } });

export async function createReviewReport(prisma: PrismaClient, customerId: string, orderId: string, version: number, reason: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const review = await tx.orderReview.findFirst({ where: { orderId, order: { request: { customerId } } } });
      if (!review) throw unavailable();
      if (review.version !== version) throw conflictError('Review has changed; retry.');
      return view(await tx.reviewReport.create({ data: { reviewId: review.id, reporterId: customerId, reviewVersion: version, ratingSnapshot: review.rating, commentSnapshot: review.comment, reason } }));
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) throw conflictError('Report already exists or review changed.');
    throw error;
  }
}
export async function listReviewReports(prisma: PrismaClient, actorId: string, offset: number, limit: number) {
  return (await prisma.reviewReport.findMany({ where: permitted(actorId), orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: offset, take: limit })).map(view);
}
export async function decideReviewReport(prisma: PrismaClient, actorId: string, reportId: string, decision: ReviewReportDecision) {
  try {
    return await prisma.$transaction(async (tx) => {
      const where = { id: reportId, ...permitted(actorId) };
      const report = await tx.reviewReport.findFirst({ where });
      if (!report) throw unavailable();
      if (report.status !== 'OPEN') throw conflictError('Report has already been handled.');
      const changed = await tx.reviewReport.updateMany({ where: { ...where, status: 'OPEN' }, data: { status: decision.targetStatus } });
      if (!changed.count) throw conflictError('Report has already been handled.');
      await tx.auditLog.create({ data: { actorId, action: 'REVIEW_REPORT_DECIDED', resourceType: 'REVIEW_REPORT', resourceId: reportId,
        metadata: { reviewId: report.reviewId, reviewVersion: report.reviewVersion, fromStatus: 'OPEN', toStatus: decision.targetStatus, reason: decision.reason } } });
      return view(await tx.reviewReport.findUniqueOrThrow({ where: { id: reportId } }));
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw conflictError('Report has changed; retry.');
    throw error;
  }
}
