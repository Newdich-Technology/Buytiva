import type { ShoppingRequestRepository } from '../../../interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
import type { ShoppingRequestInput } from '../../../models/shoppingRequests/shoppingRequest.model.js';
export function createShoppingRequestCommand(repo: ShoppingRequestRepository, customer: string, input: ShoppingRequestInput) { return repo.create(customer, input); }
