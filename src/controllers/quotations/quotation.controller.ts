import type { QuotationRepository } from '../../interfaces/quotations/quotationRepository.interface.js';
import type { QuoteInput } from '../../models/quotations/quotation.model.js';
import { issueQuotationCommand } from '../../services/quotations/commands/issueQuotation.command.js';
import { decideQuotationCommand } from '../../services/quotations/commands/decideQuotation.command.js';
import { getQuotationQuery } from '../../services/quotations/queries/getQuotation.query.js';
import { listQuotationsQuery } from '../../services/quotations/queries/listQuotations.query.js';
export class QuotationController {
  constructor(private readonly repo: QuotationRepository) {}
  issue(actor: string, input: QuoteInput) { return issueQuotationCommand(this.repo, actor, input); }
  decide(actor: string, id: string, decision: 'ACCEPTED' | 'REJECTED') { return decideQuotationCommand(this.repo, actor, id, decision); }
  get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) { return getQuotationQuery(this.repo, actor, role, id); }
  list(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) { return listQuotationsQuery(this.repo, actor, role, id); }
}
