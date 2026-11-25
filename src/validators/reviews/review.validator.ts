import type { ReviewInput } from '../../models/reviews/review.model.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';
export function validateReview(input: ReviewInput): ReviewInput {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 ||
      (input.comment !== null && (typeof input.comment !== 'string' || input.comment.length > 2000))) {
    throw new AppError(ErrorCode.VALIDATION, 400, 'Invalid review.');
  }
  return { rating: input.rating, comment: input.comment?.trim() || null };
}
