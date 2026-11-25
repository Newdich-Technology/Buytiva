import type { ListInput, StoredItemInput, ShoppingListView } from '../../models/shoppingLists/shoppingList.model.js';

export interface ShoppingListRepository {
  create(ownerId: string, input: ListInput): Promise<ShoppingListView>;
  get(ownerId: string, listId: string): Promise<ShoppingListView | null>;
  list(ownerId: string, offset: number, limit: number): Promise<ShoppingListView[]>;
  addItem(ownerId: string, listId: string, input: StoredItemInput): Promise<ShoppingListView | null>;
  updateItem(ownerId: string, listId: string, itemId: string, input: StoredItemInput): Promise<ShoppingListView | null>;
  removeItem(ownerId: string, listId: string, itemId: string): Promise<ShoppingListView | null>;
  deleteDraft(ownerId: string, listId: string): Promise<boolean>;
  submit(ownerId: string, listId: string): Promise<ShoppingListView | null>;
}
