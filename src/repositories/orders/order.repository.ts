import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { OrderRepository } from '../../interfaces/orders/orderRepository.interface.js';
import type { OrderView, TransitionRule } from '../../models/orders/order.model.js';
import type { RequestAddressSnapshot } from '../../models/shoppingRequests/shoppingRequest.model.js';
import { eligibleOwner } from '../procurerServices/procurerServices.repository.js';
import { conflictError } from '../../errors/auths/auth.error.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';

const include = { quotation: true, history: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } satisfies Prisma.ProcurementOrderInclude;
type Row = Prisma.ProcurementOrderGetPayload<{ include: typeof include }>;
function view(row: Row): OrderView {
  return { id: row.id, quotationId: row.quotationId, requestId: row.requestId, status: row.status, currency: row.quotation.currency, totalMinor: row.quotation.totalMinor.toString(),
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), history: row.history.map((entry) => ({ fromStatus: entry.fromStatus, toStatus: entry.toStatus, actorId: entry.actorId, createdAt: entry.createdAt.toISOString() })) };
}
const missing = () => new AppError(ErrorCode.NOT_FOUND, 404, 'Order or quotation not found.');
const owner = (actor: string, role: 'CUSTOMER' | 'PROCURER'): Prisma.ShoppingRequestWhereInput => role === 'CUSTOMER' ? { customerId: actor } : { procurerId: actor, procurer: eligibleOwner(actor) };
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async create(customer: string, quotationId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const quote = await tx.quotation.findFirst({ where: { id: quotationId, status: 'ACCEPTED', request: { customerId: customer, status: 'ACCEPTED' } }, include: { request: true } });
        if (!quote) throw missing();
        // Acceptance and order creation can be separated in time. Never assign a
        // suspended or no-longer-covered procurer based only on an old quote.
        const address = quote.request.addressSnapshot as unknown as RequestAddressSnapshot;
        const zone = await tx.procurerServiceZone.findFirst({ where: {
          country: address.country, region: address.region, city: address.city, area: address.area,
          active: true, currency: quote.currency,
          profile: { userId: quote.request.procurerId, ...eligibleOwner(quote.request.procurerId), acceptingRequests: true }
        }, select: { id: true } });
        if (!zone) throw conflictError('Procurer or delivery zone is no longer available.');
        const order = await tx.procurementOrder.create({ data: { quotationId, requestId: quote.requestId, history: { create: { actorId: customer, toStatus: 'AWAITING_PAYMENT' } } }, include });
        return view(order);
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { return handleRace(error); }
  }
  async get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) {
    const order = await this.prisma.procurementOrder.findFirst({ where: { id, request: owner(actor, role) }, include });
    return order ? view(order) : null;
  }
  async list(actor: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number) {
    return (await this.prisma.procurementOrder.findMany({ where: { request: owner(actor, role) }, include, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: offset, take: limit })).map(view);
  }
  async transition(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string, rule: TransitionRule) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const current = await tx.procurementOrder.findFirst({ where: { id, request: owner(actor, role) }, include: { quotation: true, payment: true } });
        if (!current) throw missing();
        if (!rule.sources.includes(current.status)) throw conflictError('Order transition is not allowed.');
        if (rule.requiresVerifiedPayment && (!current.payment || current.payment.reversedAt || current.payment.verifiedAt > new Date() ||
          current.payment.currency !== current.quotation.currency || current.payment.amountMinor !== current.quotation.totalMinor)) throw conflictError('A matching verified payment is required.');
        if (rule.target === 'CANCELLED' && current.payment) throw conflictError('A payment record requires reconciliation before cancellation.');
        const changed = await tx.procurementOrder.updateMany({ where: { id, status: current.status, request: owner(actor, role) }, data: { status: rule.target } });
        if (!changed.count) throw conflictError('Order state changed; retry.');
        await tx.procurementOrderHistory.create({ data: { orderId: id, actorId: actor, fromStatus: current.status, toStatus: rule.target } });
        return view(await tx.procurementOrder.findUniqueOrThrow({ where: { id }, include }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { return handleRace(error); }
  }
}
function handleRace(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2034' || error.code === 'P2002')) throw conflictError('Order state changed or an order already exists.');
  throw error;
}
