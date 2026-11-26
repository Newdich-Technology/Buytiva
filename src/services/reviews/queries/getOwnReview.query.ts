import type { ReviewRepository } from '../../../interfaces/reviews/reviewRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function getOwnReviewQuery(repository: ReviewRepository, customerId: string, orderId: string) {
  const review = await repository.getOwn(customerId, orderId);
  if (!review) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Order or review not found.');
  return review;
}
