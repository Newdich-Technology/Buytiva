import type { ShoppingRequestRepository } from '../../../interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
export function listShoppingRequestsQuery(repo: ShoppingRequestRepository, actor: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number) {
  return repo.list(actor, role, offset, limit);
}
