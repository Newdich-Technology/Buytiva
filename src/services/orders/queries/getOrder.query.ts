import type { OrderRepository } from '../../../interfaces/orders/orderRepository.interface.js';
import { AppError } from '../../../errors/app.error.js';
import { ErrorCode } from '../../../enums/errorCode.enum.js';
export async function getOrderQuery(repo: OrderRepository, actor: string, role: 'CUSTOMER' | 'PROCURER', id: string) {
  const order = await repo.get(actor, role, id);
  if (!order) throw new AppError(ErrorCode.NOT_FOUND, 404, 'Order not found.');
  return order;
}
