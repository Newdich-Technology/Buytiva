import type { OrderRepository } from '../../../interfaces/orders/orderRepository.interface.js';
import type { OrderAction, TransitionRule } from '../../../models/orders/order.model.js';
import { permissionDeniedError } from '../../../errors/auths/auth.error.js';
export function orderTransitionCommand(repo: OrderRepository, actor: string, role: 'CUSTOMER' | 'PROCURER', id: string, action: OrderAction) {
  const rules: Record<OrderAction, { roles: ('CUSTOMER' | 'PROCURER')[]; rule: TransitionRule }> = {
    START: { roles: ['PROCURER'], rule: { sources: ['AWAITING_PAYMENT'], target: 'IN_PROGRESS', requiresVerifiedPayment: true } },
    REPORT_DELIVERY: { roles: ['PROCURER'], rule: { sources: ['IN_PROGRESS'], target: 'DELIVERY_REPORTED', requiresVerifiedPayment: true } },
    CONFIRM_COMPLETION: { roles: ['CUSTOMER'], rule: { sources: ['DELIVERY_REPORTED'], target: 'COMPLETED', requiresVerifiedPayment: true } },
    DISPUTE: { roles: ['CUSTOMER', 'PROCURER'], rule: { sources: ['IN_PROGRESS', 'DELIVERY_REPORTED'], target: 'DISPUTED', requiresVerifiedPayment: true } },
    CANCEL: { roles: ['CUSTOMER'], rule: { sources: ['AWAITING_PAYMENT'], target: 'CANCELLED', requiresVerifiedPayment: false } }
  };
  const selected = rules[action];
  if (!selected.roles.includes(role)) throw permissionDeniedError();
  return repo.transition(actor, role, id, selected.rule);
}
