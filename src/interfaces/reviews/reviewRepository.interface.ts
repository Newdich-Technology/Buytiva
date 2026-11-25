import type { ReviewInput, ReviewView, ModerationView, ReviewDecision } from '../../models/reviews/review.model.js';
export interface ReviewRepository {
  listForModeration(actorId: string, offset: number, limit: number): Promise<ModerationView[]>;
  moderate(actorId: string, reviewId: string, decision: ReviewDecision): Promise<ModerationView>;
  create(customerId: string, orderId: string, input: ReviewInput): Promise<ReviewView>;
  getOwn(customerId: string, orderId: string): Promise<ReviewView | null>;
}
