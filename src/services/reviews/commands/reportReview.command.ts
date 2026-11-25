import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
import { invalidInputError } from '../../../errors/auths/auth.error.js';
export function reportReviewCommand(repository: ReviewRepository, customerId: string, orderId: string, version: number, input: string) {
  const reason = input.trim();
  if (reason.length < 8 || reason.length > 1000) throw invalidInputError('A report reason is required.');
  return repository.report(customerId, orderId, version, reason);
}
