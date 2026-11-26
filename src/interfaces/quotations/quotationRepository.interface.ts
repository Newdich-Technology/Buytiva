import type { CalculateQuote, CommissionPolicy, QuoteInput, QuoteView } from '../../models/quotations/quotation.model.js';
export interface QuotationRepository {
  issue(procurer: string, input: QuoteInput, commission: CommissionPolicy, calculate: CalculateQuote, now: Date): Promise<QuoteView>;
  decide(customer: string, id: string, decision: 'ACCEPTED' | 'REJECTED', now: Date): Promise<QuoteView>;
  get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string): Promise<QuoteView | null>;
  list(actor: string, role: 'CUSTOMER' | 'PROCURER', requestId: string): Promise<QuoteView[]>;
}
