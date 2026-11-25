import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
export function listModerationReviewsQuery(repository: ReviewRepository, actorId: string, offset: number, limit: number) {
  return repository.listForModeration(actorId, offset, limit);
}
