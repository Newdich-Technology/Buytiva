import type { QuotationRepository } from '../../../interfaces/quotations/quotationRepository.interface.js';
export function listQuotationsQuery(repo: QuotationRepository, actor: string, role: 'CUSTOMER' | 'PROCURER', requestId: string) { return repo.list(actor, role, requestId); }
