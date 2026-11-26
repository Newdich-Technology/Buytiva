import { Prisma, type PrismaClient } from '../../generated/prisma/client.js';
import type { ShoppingListRepository } from '../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ListInput, ShoppingListView, StoredItemInput } from '../../models/shoppingLists/shoppingList.model.js';

const includeItems = { items: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } satisfies Prisma.ShoppingListInclude;
type Row = Prisma.ShoppingListGetPayload<{ include: typeof includeItems }>;
type Tx = Prisma.TransactionClient;

function view(row: Row): ShoppingListView {
  return {
    id: row.id, title: row.title, currency: row.currency, notes: row.notes, status: row.status,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), submittedAt: row.submittedAt?.toISOString() ?? null,
    items: row.items.map((item) => ({ id: item.id, name: item.name,
      quantity: `${Math.floor(item.quantityMilli / 1000)}.${String(item.quantityMilli % 1000).padStart(3, '0')}`,
      expectedUnitPriceMinor: item.expectedUnitPriceMinor.toString(), notes: item.notes }))
  };
}

/** All draft mutations acquire the same parent row lock before accessing items. */
export class PrismaShoppingListRepository implements ShoppingListRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(ownerId: string, input: ListInput): Promise<ShoppingListView> {
    return view(await this.prisma.shoppingList.create({ data: { customerId: ownerId, title: input.title, currency: input.currency, notes: input.notes ?? null }, include: includeItems }));
  }
  async rename(ownerId: string, listId: string, title: string): Promise<ShoppingListView | null> {
    return this.prisma.$transaction(async (tx) => {
      if (!await this.locked(tx, ownerId, listId)) return null;
      await tx.shoppingList.update({ where: { id: listId }, data: { title } });
      return this.current(tx, listId);
    });
  }
  async get(ownerId: string, listId: string): Promise<ShoppingListView | null> {
    const row = await this.prisma.shoppingList.findFirst({ where: { id: listId, customerId: ownerId }, include: includeItems });
    return row ? view(row) : null;
  }
  async list(ownerId: string, offset: number, limit: number): Promise<ShoppingListView[]> {
    const rows = await this.prisma.shoppingList.findMany({ where: { customerId: ownerId }, skip: offset, take: limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], include: includeItems });
    return rows.map(view);
  }
  private async locked(tx: Tx, ownerId: string, listId: string): Promise<boolean> {
    const result = await tx.shoppingList.updateMany({ where: { id: listId, customerId: ownerId, status: 'DRAFT' }, data: { revision: { increment: 1 } } });
    return result.count === 1;
  }
  private async current(tx: Tx, listId: string): Promise<ShoppingListView> {
    return view(await tx.shoppingList.findUniqueOrThrow({ where: { id: listId }, include: includeItems }));
  }
  async addItem(ownerId: string, listId: string, input: StoredItemInput): Promise<ShoppingListView | null> {
    return this.prisma.$transaction(async (tx) => {
      if (!await this.locked(tx, ownerId, listId)) return null;
      if (await tx.shoppingListItem.count({ where: { listId } }) >= 100) throw new RangeError('Shopping list item limit reached');
      await tx.shoppingListItem.create({ data: { ...input, listId } });
      return this.current(tx, listId);
    });
  }
  async updateItem(ownerId: string, listId: string, itemId: string, input: StoredItemInput): Promise<ShoppingListView | null> {
    return this.prisma.$transaction(async (tx) => {
      if (!await this.locked(tx, ownerId, listId)) return null;
      const result = await tx.shoppingListItem.updateMany({ where: { id: itemId, listId }, data: input });
      return result.count ? this.current(tx, listId) : null;
    });
  }
  async removeItem(ownerId: string, listId: string, itemId: string): Promise<ShoppingListView | null> {
    return this.prisma.$transaction(async (tx) => {
      if (!await this.locked(tx, ownerId, listId)) return null;
      const result = await tx.shoppingListItem.deleteMany({ where: { id: itemId, listId } });
      return result.count ? this.current(tx, listId) : null;
    });
  }
  async deleteDraft(ownerId: string, listId: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      if (!await this.locked(tx, ownerId, listId)) return false;
      await tx.shoppingList.delete({ where: { id: listId } });
      return true;
    });
  }
  async submit(ownerId: string, listId: string): Promise<ShoppingListView | null> {
    return this.prisma.$transaction(async (tx) => {
      if (!await this.locked(tx, ownerId, listId)) return null;
      if (!await tx.shoppingListItem.count({ where: { listId } })) throw new RangeError('A list must contain an item before submission');
      await tx.shoppingList.update({ where: { id: listId }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
      return this.current(tx, listId);
    });
  }
}
