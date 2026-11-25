import type { ReviewRepository } from '../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput, ReviewDecision, ReviewReportDecision } from '../../models/reviews/review.model.js';
import { reportReviewCommand } from '../../services/reviews/commands/reportReview.command.js';
import { decideReviewReportCommand } from '../../services/reviews/commands/decideReviewReport.command.js';
import { listReviewReportsQuery } from '../../services/reviews/queries/listReviewReports.query.js';
import { getRatingSummaryQuery } from '../../services/reviews/queries/getRatingSummary.query.js';
import { moderateReviewCommand } from '../../services/reviews/commands/moderateReview.command.js';
import { listModerationReviewsQuery } from '../../services/reviews/queries/listModerationReviews.query.js';
import { editReviewCommand } from '../../services/reviews/commands/editReview.command.js';
import { createReviewCommand } from '../../services/reviews/commands/createReview.command.js';
import { getOwnReviewQuery } from '../../services/reviews/queries/getOwnReview.query.js';
export class ReviewController {
  constructor(private readonly repository: ReviewRepository) {}
  report(customerId: string, orderId: string, version: number, reason: string) { return reportReviewCommand(this.repository, customerId, orderId, version, reason); }
  listReports(actorId: string, offset: number, limit: number) { return listReviewReportsQuery(this.repository, actorId, offset, limit); }
  decideReport(actorId: string, reportId: string, decision: ReviewReportDecision) { return decideReviewReportCommand(this.repository, actorId, reportId, decision); }
  ratingSummary(procurerId: string) { return getRatingSummaryQuery(this.repository, procurerId); }
  moderate(actorId: string, reviewId: string, decision: ReviewDecision) { return moderateReviewCommand(this.repository, actorId, reviewId, decision); }
  listForModeration(actorId: string, offset: number, limit: number) { return listModerationReviewsQuery(this.repository, actorId, offset, limit); }
  edit(customerId: string, orderId: string, version: number, input: ReviewInput) { return editReviewCommand(this.repository, customerId, orderId, version, input); }
  create(customerId: string, orderId: string, input: ReviewInput) { return createReviewCommand(this.repository, customerId, orderId, input); }
  getOwn(customerId: string, orderId: string) { return getOwnReviewQuery(this.repository, customerId, orderId); }
}
