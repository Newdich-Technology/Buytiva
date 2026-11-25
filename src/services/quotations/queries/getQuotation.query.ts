import type { QuotationRepository } from '../../../interfaces/quotations/quotationRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function getQuotationQuery(repo: QuotationRepository, actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) {
  const result = await repo.get(actor, role, id);
  if (!result) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Quotation unavailable.');
  return result;
}
