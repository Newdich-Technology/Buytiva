import { describe, expect, it, vi } from 'vitest';
import { orderTransitionCommand } from '../../../src/services/orders/commands/orderTransition.command.js';
import type { OrderRepository } from '../../../src/interfaces/orders/orderRepository.interface.js';

describe('order role permissions', () => {
  it.each([['PROCURER', 'CONFIRM_COMPLETION'], ['PROCURER', 'CANCEL'], ['CUSTOMER', 'START'], ['CUSTOMER', 'REPORT_DELIVERY']] as const)('rejects %s attempting %s before repository mutation', (role, action) => {
    const transition = vi.fn(); const repo = { transition } as unknown as OrderRepository;
    expect(() => orderTransitionCommand(repo, 'actor', role, 'order', action)).toThrow();
    expect(transition).not.toHaveBeenCalled();
  });
});
