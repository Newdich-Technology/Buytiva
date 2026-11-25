import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { ShoppingRequestRepository } from '../../interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
import type { ShoppingRequestInput, ShoppingRequestView, RequestAddressSnapshot, RequestListSnapshot } from '../../models/shoppingRequests/shoppingRequest.model.js';
import { eligibleOwner } from '../procurerServices/procurerServices.repository.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';
import { conflictError } from '../../errors/auths/auth.error.js';

type Row = Prisma.ShoppingRequestGetPayload<Record<string, never>>;
function view(row: Row): ShoppingRequestView {
  return { id: row.id, customerId: row.customerId, procurerId: row.procurerId, shoppingListId: row.shoppingListId, status: row.status,
    address: row.addressSnapshot as unknown as RequestAddressSnapshot, list: row.listSnapshot as unknown as RequestListSnapshot,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
const notFound = () => new AppError(ErrorCode.NOT_FOUND, 404, 'Shopping list, address, or procurer is unavailable.');
export class PrismaShoppingRequestRepository implements ShoppingRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async create(customerId: string, input: ShoppingRequestInput) {
    if (customerId === input.procurerId) throw notFound();
    try {
      return await this.prisma.$transaction(async (tx) => {
        const list = await tx.shoppingList.findFirst({ where: { id: input.listId, customerId, status: 'SUBMITTED' },
          include: { items: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } });
        const address = await tx.customerAddress.findFirst({ where: { id: input.addressId, customerId } });
        if (!list || !address || list.items.length === 0) throw notFound();
        const zone = await tx.procurerServiceZone.findFirst({ where: { country: address.country, region: address.region, city: address.city, area: address.area,
          active: true, currency: list.currency, profile: { userId: input.procurerId, ...eligibleOwner(input.procurerId), acceptingRequests: true,
            publicName: { not: null }, pricingPolicies: { some: { currency: list.currency } } } }, select: { id: true } });
        if (!zone) throw notFound();
        const addressSnapshot = { label: address.label, line1: address.line1, line2: address.line2, country: address.country, region: address.region, city: address.city, area: address.area };
        const listSnapshot = { title: list.title, currency: list.currency, notes: list.notes, items: list.items.map((item) => ({ id: item.id, name: item.name,
          quantity: `${Math.floor(item.quantityMilli / 1000)}.${String(item.quantityMilli % 1000).padStart(3, '0')}`, expectedUnitPriceMinor: item.expectedUnitPriceMinor.toString(), notes: item.notes })) };
        return view(await tx.shoppingRequest.create({ data: { customerId, procurerId: input.procurerId, shoppingListId: list.id, addressSnapshot, listSnapshot } }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw conflictError('A request for this list and procurer already exists.');
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw conflictError('Request state changed; retry.');
      throw error;
    }
  }
  async get(actorId: string, role: 'CUSTOMER' | 'PROCURER', id: string) {
    const row = await this.prisma.shoppingRequest.findFirst({ where: { id, ...(role === 'CUSTOMER' ? { customerId: actorId } : { procurerId: actorId, procurer: eligibleOwner(actorId) }) } });
    return row ? view(row) : null;
  }
  async list(actorId: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number) {
    const rows = await this.prisma.shoppingRequest.findMany({ where: role === 'CUSTOMER' ? { customerId: actorId } : { procurerId: actorId, procurer: eligibleOwner(actorId) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: offset, take: limit });
    return rows.map(view);
  }
  async cancel(customerId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.shoppingRequest.updateMany({ where: { id, customerId, status: 'REQUESTED' }, data: { status: 'CANCELLED' } });
      return changed.count ? view(await tx.shoppingRequest.findUniqueOrThrow({ where: { id } })) : null;
    });
  }
}
