import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
export function getRatingSummaryQuery(repository: ReviewRepository, procurerId: string) { return repository.ratingSummary(procurerId); }
