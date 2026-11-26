import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ItemInput } from '../../../models/shoppingLists/shoppingList.model.js';
import { validateItem } from '../../../validators/shoppingLists/shoppingList.validator.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';

export async function changeShoppingListCommand(repo: ShoppingListRepository, owner: string, list: string,
  action: { type: 'add'; input: ItemInput } | { type: 'edit'; id: string; input: ItemInput } | { type: 'remove'; id: string } | { type: 'submit' }) {
  try {
    const result = action.type === 'add' ? await repo.addItem(owner, list, validateItem(action.input))
      : action.type === 'edit' ? await repo.updateItem(owner, list, action.id, validateItem(action.input))
      : action.type === 'remove' ? await repo.removeItem(owner, list, action.id)
      : await repo.submit(owner, list);
    if (!result) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Draft list or item not found.');
    return result;
  } catch (error) {
    if (error instanceof RangeError) throw new AppError(ErrorCode.VALIDATION, 400, error.message);
    throw error;
  }
}
