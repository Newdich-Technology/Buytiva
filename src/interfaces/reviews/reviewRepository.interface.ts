import type { ReviewInput, ReviewView, ModerationView, ReviewDecision, RatingSummary, ReviewReportView, ReviewReportDecision } from '../../models/reviews/review.model.js';
export interface ReviewRepository {
  report(customerId: string, orderId: string, version: number, reason: string): Promise<ReviewReportView>;
  listReports(actorId: string, offset: number, limit: number): Promise<ReviewReportView[]>;
  decideReport(actorId: string, reportId: string, decision: ReviewReportDecision): Promise<ReviewReportView>;
  ratingSummary(procurerId: string): Promise<RatingSummary>;
  listForModeration(actorId: string, offset: number, limit: number): Promise<ModerationView[]>;
  moderate(actorId: string, reviewId: string, decision: ReviewDecision): Promise<ModerationView>;
  edit(customerId: string, orderId: string, expectedVersion: number, input: ReviewInput): Promise<ReviewView>;
  create(customerId: string, orderId: string, input: ReviewInput): Promise<ReviewView>;
  getOwn(customerId: string, orderId: string): Promise<ReviewView | null>;
}
