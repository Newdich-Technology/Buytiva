import type { OrderRepository } from '../../../interfaces/orders/orderRepository.interface.js';
export function listOrdersQuery(repo: OrderRepository, actor: string, role: 'CUSTOMER' | 'PROCURER', offset: number, limit: number) { return repo.list(actor, role, offset, limit); }
