import type { OrderRepository } from '../../../interfaces/orders/orderRepository.interface.js';
export function createOrderCommand(repo: OrderRepository, customer: string, quotationId: string) { return repo.create(customer, quotationId); }
