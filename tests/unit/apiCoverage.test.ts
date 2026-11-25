import { describe, expect, it } from 'vitest';
import { createBuytivaFastifyApplication } from '../../src/app.js';
import type { AuthDependencies } from '../../src/types/authDependencies.type.js';
import type { AddressRepository } from '../../src/interfaces/addresses/addressRepository.interface.js';
import type { ShoppingListRepository } from '../../src/interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ProcurerServicesRepository } from '../../src/interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { ShoppingRequestRepository } from '../../src/interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
import type { QuotationRepository } from '../../src/interfaces/quotations/quotationRepository.interface.js';
import type { ReviewRepository } from '../../src/interfaces/reviews/reviewRepository.interface.js';
import type { OrderRepository } from '../../src/interfaces/orders/orderRepository.interface.js';

describe('registered API and OpenAPI coverage', () => {
  it('publishes the implemented route families and rejects unauthenticated private requests', async () => {
    const app = createBuytivaFastifyApplication({ authDependencies: {} as AuthDependencies, addressRepository: {} as AddressRepository,
      shoppingListRepository: {} as ShoppingListRepository, procurerServicesRepository: {} as ProcurerServicesRepository,
      shoppingRequestRepository: {} as ShoppingRequestRepository, quotationRepository: {} as QuotationRepository, orderRepository: {} as OrderRepository, reviewRepository: {} as ReviewRepository });
    try {
      await app.ready();
      const openapi = app.swagger();
      for (const path of ['/api/v1/health', '/api/v1/auth/register', '/api/v1/auth/login', '/api/v1/addresses', '/api/v1/shopping-lists',
        '/api/v1/procurers/discovery', '/api/v1/pricing/preview', '/api/v1/shopping-requests', '/api/v1/quotations/{quotationId}', '/api/v1/orders', '/api/v1/orders/{orderId}/review']) {
        expect(openapi.paths?.[path], path).toBeDefined();
      }
      for (const path of ['/api/v1/addresses', '/api/v1/shopping-lists', '/api/v1/procurers/discovery?country=NG&region=fct&city=abuja&area=wuse', '/api/v1/shopping-requests', '/api/v1/orders', '/api/v1/orders/00000000-0000-4000-8000-000000000001/review']) {
        const response = await app.inject({ method: 'GET', url: path });
        expect(response.statusCode, path).toBe(401);
        expect(response.json()).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
      }
    } finally { await app.close(); }
  });
});
