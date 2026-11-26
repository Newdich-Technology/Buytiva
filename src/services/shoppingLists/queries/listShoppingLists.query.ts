import type { ShoppingListRepository } from '../../../interfaces/shoppingLists/shoppingListRepository.interface.js';
export function listShoppingListsQuery(repo: ShoppingListRepository, owner: string, offset: number, limit: number) {
  return repo.list(owner, offset, limit);
}
