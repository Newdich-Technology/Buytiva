import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function deleteShoppingListCommand(repo: ShoppingListRepository, owner: string, id: string) {
  if (!await repo.deleteDraft(owner, id)) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Draft list not found.');
  return { deleted: true as const };
}
