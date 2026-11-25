import type { ReviewInput, ReviewView } from '../../models/reviews/review.model.js';
export interface ReviewRepository {
  create(customerId: string, orderId: string, input: ReviewInput): Promise<ReviewView>;
  getOwn(customerId: string, orderId: string): Promise<ReviewView | null>;
}
