import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
import type { ReviewReportDecision } from '../../../models/reviews/review.model.js';
import { invalidInputError } from '../../../errors/auths/auth.error.js';
export function decideReviewReportCommand(repository: ReviewRepository, actorId: string, reportId: string, input: ReviewReportDecision) {
  const reason = input.reason.trim();
  if (reason.length < 8 || reason.length > 1000) throw invalidInputError('A decision reason is required.');
  return repository.decideReport(actorId, reportId, { ...input, reason });
}
