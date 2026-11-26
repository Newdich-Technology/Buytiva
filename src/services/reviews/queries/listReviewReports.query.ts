import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
export function listReviewReportsQuery(repository: ReviewRepository, actorId: string, offset: number, limit: number) {
  return repository.listReports(actorId, offset, limit);
}
