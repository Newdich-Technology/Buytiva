import type { ShoppingRequestInput, ShoppingRequestView } from '../../models/shoppingRequests/shoppingRequest.model.js';
export interface ShoppingRequestRepository {
  create(customerId: string, input: ShoppingRequestInput): Promise<ShoppingRequestView>;
  get(actorId: string, role: 'CUSTOMER' | 'PROCURER', id: string): Promise<ShoppingRequestView | null>;
  list(actorId: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number): Promise<ShoppingRequestView[]>;
  cancel(customerId: string, id: string): Promise<ShoppingRequestView | null>;
}
