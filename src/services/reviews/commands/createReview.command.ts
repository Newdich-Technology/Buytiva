import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput } from '../../../models/reviews/review.model.js';
import { validateReview } from '../../../validators/reviews/review.validator.js';
export function createReviewCommand(repository: ReviewRepository, customerId: string, orderId: string, input: ReviewInput) {
  return repository.create(customerId, orderId, validateReview(input));
}
