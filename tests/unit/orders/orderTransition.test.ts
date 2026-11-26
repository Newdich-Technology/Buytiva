import { describe, expect, it, vi } from 'vitest';
import { orderTransitionCommand } from '../../../src/services/orders/commands/orderTransition.command.js';
import type { OrderRepository } from '../../../src/interfaces/orders/orderRepository.interface.js';

describe('order transition rules', () => {
  it.each([
    ['PROCURER', 'START', ['AWAITING_PAYMENT'], 'IN_PROGRESS', true],
    ['PROCURER', 'REPORT_DELIVERY', ['IN_PROGRESS'], 'DELIVERY_REPORTED', true],
    ['CUSTOMER', 'CONFIRM_COMPLETION', ['DELIVERY_REPORTED'], 'COMPLETED', true],
    ['CUSTOMER', 'DISPUTE', ['IN_PROGRESS', 'DELIVERY_REPORTED'], 'DISPUTED', true],
    ['CUSTOMER', 'CANCEL', ['AWAITING_PAYMENT'], 'CANCELLED', false]
  ] as const)('requires the expected prior state and payment check for %s %s', (role, action, sources, target, requiresVerifiedPayment) => {
    const transition = vi.fn();
    const repo = { transition } as unknown as OrderRepository;
    orderTransitionCommand(repo, 'actor', role, 'order', action);
    expect(transition).toHaveBeenCalledWith('actor', role, 'order', { sources, target, requiresVerifiedPayment });
  });
});
