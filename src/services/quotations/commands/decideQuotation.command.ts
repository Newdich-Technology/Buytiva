import type { QuotationRepository } from '../../../interfaces/quotations/quotationRepository.interface.js';
export function decideQuotationCommand(repo: QuotationRepository, customer: string, id: string, decision: 'ACCEPTED' | 'REJECTED') { return repo.decide(customer, id, decision, new Date()); }
