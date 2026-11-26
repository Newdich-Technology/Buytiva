import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewDecision } from '../../../models/reviews/review.model.js';
import { invalidInputError } from '../../../errors/auths/auth.error.js';
export function moderateReviewCommand(repository: ReviewRepository, actorId: string, reviewId: string, decision: ReviewDecision) {
  const reason = decision.reason.trim();
  if (reason.length < 8 || reason.length > 1000) throw invalidInputError('A moderation reason is required.');
  return repository.moderate(actorId, reviewId, { ...decision, reason });
}
