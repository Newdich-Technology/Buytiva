import type { ShoppingRequestRepository } from '../../interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
import type { ShoppingRequestInput } from '../../models/shoppingRequests/shoppingRequest.model.js';
import { createShoppingRequestCommand } from '../../services/shoppingRequests/commands/createShoppingRequest.command.js';
import { cancelShoppingRequestCommand } from '../../services/shoppingRequests/commands/cancelShoppingRequest.command.js';
import { getShoppingRequestQuery } from '../../services/shoppingRequests/queries/getShoppingRequest.query.js';
import { listShoppingRequestsQuery } from '../../services/shoppingRequests/queries/listShoppingRequests.query.js';
export class ShoppingRequestController {
  constructor(private readonly repo: ShoppingRequestRepository) {}
  create(owner: string, input: ShoppingRequestInput) { return createShoppingRequestCommand(this.repo, owner, input); }
  get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) { return getShoppingRequestQuery(this.repo, actor, role, id); }
  list(actor: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number) { return listShoppingRequestsQuery(this.repo, actor, role, offset, limit); }
  cancel(owner: string, id: string) { return cancelShoppingRequestCommand(this.repo, owner, id); }
}
