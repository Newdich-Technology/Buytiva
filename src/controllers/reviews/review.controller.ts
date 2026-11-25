import type { ReviewRepository } from '../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput } from '../../models/reviews/review.model.js';
import { createReviewCommand } from '../../services/reviews/commands/createReview.command.js';
import { getOwnReviewQuery } from '../../services/reviews/queries/getOwnReview.query.js';
export class ReviewController {
  constructor(private readonly repository: ReviewRepository) {}
  create(customerId: string, orderId: string, input: ReviewInput) { return createReviewCommand(this.repository, customerId, orderId, input); }
  getOwn(customerId: string, orderId: string) { return getOwnReviewQuery(this.repository, customerId, orderId); }
}
