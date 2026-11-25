import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import { validateListTitle } from '../../../validators/shoppingLists/shoppingList.validator.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function renameShoppingListCommand(repo: ShoppingListRepository, owner: string, id: string, title: string) {
  const result = await repo.rename(owner, id, validateListTitle(title));
  if (!result) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Draft list not found.');
  return result;
}
