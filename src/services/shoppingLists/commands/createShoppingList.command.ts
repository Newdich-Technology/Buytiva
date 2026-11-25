import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ListInput } from '../../../models/shoppingLists/shoppingList.model.js';
import { validateList } from '../../../validators/shoppingLists/shoppingList.validator.js';
export function createShoppingListCommand(repo: ShoppingListRepository, owner: string, input: ListInput) {
  return repo.create(owner, validateList(input));
}
