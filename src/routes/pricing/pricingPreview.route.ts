import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { AddressRepository } from '../../interfaces/addresses/addressRepository.interface.js';
import type { ShoppingListRepository } from '../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { PricingPreviewController } from '../../controllers/pricing/pricingPreview.controller.js';
import { previewBody, previewResponse } from '../../dtos/pricing/pricingPreview.dto.js';
interface Options { authDependencies: AuthDependencies; addressRepository: AddressRepository; shoppingListRepository: ShoppingListRepository; procurerServicesRepository: ProcurerServicesRepository }
export const pricingPreviewRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new PricingPreviewController({ addresses: options.addressRepository, lists: options.shoppingListRepository, procurers: options.procurerServicesRepository });
  api.post('/pricing/preview', { preHandler: [createAuthenticateMiddleware(options.authDependencies), requireAuthenticatedRole(UserRole.CUSTOMER)],
    schema: { tags: ['pricing'], security: [{ bearerAuth: [] }], body: previewBody, response: { 200: previewResponse }, operationId: 'previewProcurementPricing' } },
  async (request) => controller.preview(getAuthenticatedPrincipal(request).userId, request.body));
};
