import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { QuotationRepository } from '../../interfaces/quotations/quotationRepository.interface.js';
import type { CalculateQuote, CommissionPolicy, QuoteInput, QuoteView } from '../../models/quotations/quotation.model.js';
import type { RequestAddressSnapshot, RequestListSnapshot } from '../../models/shoppingRequests/shoppingRequest.model.js';
import { eligibleOwner } from '../procurerServices/procurerServices.repository.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';
import { conflictError } from '../../errors/auths/auth.error.js';

const includeRequest = { request: true } satisfies Prisma.QuotationInclude;
type Row = Prisma.QuotationGetPayload<{ include: typeof includeRequest }>;
function view(row: Row): QuoteView {
  return { id: row.id, requestId: row.requestId, revision: row.revision, status: row.status, policyId: row.policyId, currency: row.currency,
    subtotalMinor: row.subtotalMinor.toString(), serviceFeeMinor: row.serviceFeeMinor.toString(), deliveryFeeMinor: row.deliveryFeeMinor.toString(), totalMinor: row.totalMinor.toString(),
    expiresAt: row.expiresAt.toISOString(), createdAt: row.createdAt.toISOString(), decidedAt: row.decidedAt?.toISOString() ?? null,
    address: row.request.addressSnapshot as unknown as RequestAddressSnapshot, list: row.request.listSnapshot as unknown as RequestListSnapshot };
}
const unavailable = () => new AppError(ErrorCode.NOT_FOUND, 404, 'Quotation or request unavailable.');
export class PrismaQuotationRepository implements QuotationRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async issue(procurer: string, input: QuoteInput, commission: CommissionPolicy, calculate: CalculateQuote, _now: Date) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const locked = await tx.shoppingRequest.updateMany({ where: { id: input.requestId, procurerId: procurer, quotationRevision: input.expectedRevision,
          status: { in: ['REQUESTED', 'QUOTED'] }, procurer: eligibleOwner(procurer), customer: { status: 'ACTIVE', emailVerifiedAt: { not: null } } },
        data: { quotationRevision: { increment: 1 }, status: 'QUOTED' } });
        if (!locked.count) throw conflictError('Request is unavailable or its revision changed.');
        const request = await tx.shoppingRequest.findUniqueOrThrow({ where: { id: input.requestId } });
        const address = request.addressSnapshot as unknown as RequestAddressSnapshot;
        const list = request.listSnapshot as unknown as RequestListSnapshot;
        const zone = await tx.procurerServiceZone.findFirst({ where: { country: address.country, region: address.region, city: address.city, area: address.area,
          active: true, currency: list.currency, profile: { userId: procurer, ...eligibleOwner(procurer), acceptingRequests: true } },
        include: { profile: { include: { pricingPolicies: { orderBy: { version: 'desc' }, take: 1 } } } } });
        const policy = zone?.profile.pricingPolicies[0];
        if (!zone || !policy || policy.currency !== list.currency) throw unavailable();
        const expiresAt = new Date(input.expiresAt);
        if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) throw new AppError(ErrorCode.VALIDATION, 400, 'Quotation expiry must be in the future.');
        const result = calculate({ list, policyId: policy.id, currency: policy.currency, fixedFeeMinor: policy.fixedFeeMinor.toString(), thresholdMinor: policy.thresholdMinor.toString(),
          percentageBasisPoints: policy.percentageBasisPoints, deliveryFeeMinor: zone.deliveryFeeMinor.toString() });
        await tx.quotation.updateMany({ where: { requestId: request.id, status: 'ISSUED' }, data: { status: 'SUPERSEDED' } });
        const quote = await tx.quotation.create({ data: { requestId: request.id, revision: request.quotationRevision, policyId: policy.id,
          commissionPolicyVersion: commission.version, commissionBasisPoints: commission.basisPoints, currency: policy.currency,
          subtotalMinor: BigInt(result.subtotalMinor), serviceFeeMinor: BigInt(result.serviceFeeMinor), deliveryFeeMinor: BigInt(result.deliveryFeeMinor),
          totalMinor: BigInt(result.customerTotalMinor), platformCommissionMinor: BigInt(result.platformCommissionMinor), procurerEarningsMinor: BigInt(result.procurerServiceEarningsMinor), expiresAt }, include: includeRequest });
        return view(quote);
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { return handleRace(error); }
  }
  async decide(customer: string, id: string, decision: 'ACCEPTED' | 'REJECTED', _now: Date) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const quote = await tx.quotation.findFirst({ where: { id, request: { customerId: customer } }, include: includeRequest });
        if (!quote) throw unavailable();
        const locked = await tx.shoppingRequest.updateMany({ where: { id: quote.requestId, customerId: customer, status: 'QUOTED', quotationRevision: quote.revision },
          data: { status: decision === 'ACCEPTED' ? 'ACCEPTED' : 'REQUESTED' } });
        if (!locked.count) throw conflictError('Quotation is no longer current.');
        const now = new Date();
        const updated = await tx.quotation.updateMany({ where: { id, status: 'ISSUED', expiresAt: { gt: now } }, data: { status: decision, decidedAt: now } });
        if (!updated.count) throw conflictError('Quotation is expired or no longer current.');
        if (decision === 'ACCEPTED') {
          const address = quote.request.addressSnapshot as unknown as RequestAddressSnapshot;
          const available = await tx.procurerServiceZone.findFirst({ where: { country: address.country, region: address.region, city: address.city, area: address.area,
            active: true, currency: quote.currency, profile: { userId: quote.request.procurerId, ...eligibleOwner(quote.request.procurerId), acceptingRequests: true } }, select: { id: true } });
          if (!available) throw conflictError('Procurer or delivery zone is no longer available.');
          const awarded = await tx.shoppingList.updateMany({ where: { id: quote.request.shoppingListId, customerId: customer, awardedRequestId: null }, data: { awardedRequestId: quote.requestId } });
          if (!awarded.count) throw conflictError('Another quotation has already been accepted for this list.');
        }
        return view(await tx.quotation.findUniqueOrThrow({ where: { id }, include: includeRequest }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { return handleRace(error); }
  }
  async get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) {
    const quote = await this.prisma.quotation.findFirst({ where: { id, request: role === 'CUSTOMER' ? { customerId: actor } : { procurerId: actor, procurer: eligibleOwner(actor) } }, include: includeRequest });
    return quote ? view(quote) : null;
  }
  async list(actor: string, role: 'CUSTOMER' | 'PROCURER', requestId: string) {
    const rows = await this.prisma.quotation.findMany({ where: { requestId, request: role === 'CUSTOMER' ? { customerId: actor } : { procurerId: actor, procurer: eligibleOwner(actor) } }, include: includeRequest, orderBy: { revision: 'desc' }, take: 100 });
    return rows.map(view);
  }
}
function handleRace(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2034' || error.code === 'P2002')) throw conflictError('Quotation state changed; retry.');
  throw error;
}
