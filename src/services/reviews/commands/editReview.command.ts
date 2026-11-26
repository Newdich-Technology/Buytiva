import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewInput } from '../../../models/reviews/review.model.js';
import { validateReview } from '../../../validators/reviews/review.validator.js';
export function editReviewCommand(repository: ReviewRepository, customerId: string, orderId: string, version: number, input: ReviewInput) {
  return repository.edit(customerId, orderId, version, validateReview(input));
}
