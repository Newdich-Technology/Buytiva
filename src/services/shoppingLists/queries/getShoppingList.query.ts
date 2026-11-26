import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function getShoppingListQuery(repo: ShoppingListRepository, owner: string, id: string) {
  const result = await repo.get(owner, id);
  if (!result) throw new AppError(ErrorCode.NOT_FOUND, 404, 'List not found.');
  return result;
}
