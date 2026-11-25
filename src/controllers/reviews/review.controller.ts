import type { ReviewRepository } from '../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput, ReviewDecision } from '../../models/reviews/review.model.js';
import { moderateReviewCommand } from '../../services/reviews/commands/moderateReview.command.js';
import { listModerationReviewsQuery } from '../../services/reviews/queries/listModerationReviews.query.js';
import { createReviewCommand } from '../../services/reviews/commands/createReview.command.js';
import { getOwnReviewQuery } from '../../services/reviews/queries/getOwnReview.query.js';
export class ReviewController {
  constructor(private readonly repository: ReviewRepository) {}
  moderate(actorId: string, reviewId: string, decision: ReviewDecision) { return moderateReviewCommand(this.repository, actorId, reviewId, decision); }
  listForModeration(actorId: string, offset: number, limit: number) { return listModerationReviewsQuery(this.repository, actorId, offset, limit); }
  create(customerId: string, orderId: string, input: ReviewInput) { return createReviewCommand(this.repository, customerId, orderId, input); }
  getOwn(customerId: string, orderId: string) { return getOwnReviewQuery(this.repository, customerId, orderId); }
}
