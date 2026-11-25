import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { ShoppingRequestRepository } from '../../interfaces/shoppingRequests/shoppingRequestRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { ShoppingRequestController } from '../../controllers/shoppingRequests/shoppingRequest.controller.js';
import { requestInput, requestParams, pageInput, requestResponse } from '../../dtos/shoppingRequests/shoppingRequest.dto.js';
interface Options { authDependencies: AuthDependencies; shoppingRequestRepository: ShoppingRequestRepository }
export const shoppingRequestRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new ShoppingRequestController(options.shoppingRequestRepository);
  const auth = createAuthenticateMiddleware(options.authDependencies);
  const customer = [auth, requireAuthenticatedRole(UserRole.CUSTOMER)];
  const procurer = [auth, requireAuthenticatedRole(UserRole.PROCURER)];
  const common = { tags: ['shopping requests'], security: [{ bearerAuth: [] }] };
  api.post('/shopping-requests', { preHandler: customer, schema: { ...common, body: requestInput, response: { 201: requestResponse }, operationId: 'createShoppingRequest' } }, async (request, reply) => reply.code(201).send(await controller.create(getAuthenticatedPrincipal(request).userId, request.body)));
  api.get('/shopping-requests', { preHandler: customer, schema: { ...common, querystring: pageInput, response: { 200: Type.Array(requestResponse) }, operationId: 'listCustomerShoppingRequests' } }, async (request) => controller.list(getAuthenticatedPrincipal(request).userId, 'CUSTOMER', request.query.offset ?? 0, request.query.limit ?? 20));
  api.get('/shopping-requests/:requestId', { preHandler: customer, schema: { ...common, params: requestParams, response: { 200: requestResponse }, operationId: 'getCustomerShoppingRequest' } }, async (request) => controller.get(getAuthenticatedPrincipal(request).userId, 'CUSTOMER', request.params.requestId));
  api.post('/shopping-requests/:requestId/cancel', { preHandler: customer, schema: { ...common, params: requestParams, response: { 200: requestResponse }, operationId: 'cancelShoppingRequest' } }, async (request) => controller.cancel(getAuthenticatedPrincipal(request).userId, request.params.requestId));
  api.get('/procurer-services/me/requests', { preHandler: procurer, schema: { ...common, querystring: pageInput, response: { 200: Type.Array(requestResponse) }, operationId: 'listProcurerShoppingRequests' } }, async (request) => controller.list(getAuthenticatedPrincipal(request).userId, 'PROCURER', request.query.offset ?? 0, request.query.limit ?? 20));
  api.get('/procurer-services/me/requests/:requestId', { preHandler: procurer, schema: { ...common, params: requestParams, response: { 200: requestResponse }, operationId: 'getProcurerShoppingRequest' } }, async (request) => controller.get(getAuthenticatedPrincipal(request).userId, 'PROCURER', request.params.requestId));
};
