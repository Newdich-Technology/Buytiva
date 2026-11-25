import type { OrderView, TransitionRule } from '../../models/orders/order.model.js';
export interface OrderRepository {
  create(customer: string, quotationId: string): Promise<OrderView>;
  get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string): Promise<OrderView | null>;
  list(actor: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number): Promise<OrderView[]>;
  transition(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string, rule: TransitionRule): Promise<OrderView>;
}
