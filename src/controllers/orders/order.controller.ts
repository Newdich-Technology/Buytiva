import type { OrderRepository } from '../../interfaces/orders/orderRepository.interface.js';
import type { OrderAction } from '../../models/orders/order.model.js';
import { createOrderCommand } from '../../services/orders/commands/createOrder.command.js';
import { orderTransitionCommand } from '../../services/orders/commands/orderTransition.command.js';
import { getOrderQuery } from '../../services/orders/queries/getOrder.query.js';
import { listOrdersQuery } from '../../services/orders/queries/listOrders.query.js';
export class OrderController {
  constructor(private readonly repo: OrderRepository) {}
  create(actor: string, quote: string) { return createOrderCommand(this.repo, actor, quote); }
  get(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) { return getOrderQuery(this.repo, actor, role, id); }
  list(actor: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number) { return listOrdersQuery(this.repo, actor, role, offset, limit); }
  transition(actor: string, role: 'CUSTOMER' | 'PROCURER', id: string, action: OrderAction) { return orderTransitionCommand(this.repo, actor, role, id, action); }
}
