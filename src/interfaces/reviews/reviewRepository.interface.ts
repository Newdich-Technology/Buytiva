import type { ReviewInput, ReviewView, ModerationView, ReviewDecision, RatingSummary } from '../../models/reviews/review.model.js';
export interface ReviewRepository {
  ratingSummary(procurerId: string): Promise<RatingSummary>;
  listForModeration(actorId: string, offset: number, limit: number): Promise<ModerationView[]>;
  moderate(actorId: string, reviewId: string, decision: ReviewDecision): Promise<ModerationView>;
  edit(customerId: string, orderId: string, expectedVersion: number, input: ReviewInput): Promise<ReviewView>;
  create(customerId: string, orderId: string, input: ReviewInput): Promise<ReviewView>;
  getOwn(customerId: string, orderId: string): Promise<ReviewView | null>;
}
