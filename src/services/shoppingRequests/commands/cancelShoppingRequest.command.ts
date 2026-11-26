import type { ShoppingRequestRepository } from '../../../interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function cancelShoppingRequestCommand(repo: ShoppingRequestRepository, customer: string, id: string) {
  const result = await repo.cancel(customer, id);
  if (!result) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Active request not found.');
  return result;
}
