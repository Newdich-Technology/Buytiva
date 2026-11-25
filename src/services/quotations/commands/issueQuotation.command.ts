import type { QuotationRepository } from '../../../interfaces/quotations/quotationRepository.interface.js';
import type { QuoteInput } from '../../../models/quotations/quotation.model.js';
import { getCommissionPolicy } from '../../../configs/quotations/commission.config.js';
import { calculatePricingQuery } from '../../pricing/queries/calculatePricing.query.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function issueQuotationCommand(repo: QuotationRepository, procurer: string, input: QuoteInput) {
  const commission = getCommissionPolicy();
  try {
    return await repo.issue(procurer, input, commission, (data) => calculatePricingQuery(data.list.items.map((item) => ({ currency: data.list.currency,
      unitPriceMinor: item.expectedUnitPriceMinor, quantity: item.quantity })), { version: data.policyId, currency: data.currency, fixedFeeMinor: data.fixedFeeMinor,
      thresholdMinor: data.thresholdMinor, percentageBasisPoints: data.percentageBasisPoints, deliveryFeeMinor: data.deliveryFeeMinor, commissionBasisPoints: commission.basisPoints }), new Date());
  } catch (error) {
    if (error instanceof RangeError) throw new AppError(ErrorCode.VALIDATION, 400, 'Cannot calculate quotation.');
    throw error;
  }
}
