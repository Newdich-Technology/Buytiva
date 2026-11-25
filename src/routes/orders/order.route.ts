import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { OrderRepository } from '../../interfaces/orders/orderRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { OrderController } from '../../controllers/orders/order.controller.js';
import { createOrderBody, orderParams, orderPage, orderResponse } from '../../dtos/orders/order.dto.js';
interface Options { authDependencies: AuthDependencies; orderRepository: OrderRepository }
export const orderRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>(); const controller = new OrderController(options.orderRepository);
  const auth = createAuthenticateMiddleware(options.authDependencies);
  const customer = [auth, requireAuthenticatedRole(UserRole.CUSTOMER)], procurer = [auth, requireAuthenticatedRole(UserRole.PROCURER)];
  const common = { tags: ['orders'], security: [{ bearerAuth: [] }] };
  api.post('/orders', { preHandler: customer, schema: { ...common, body: createOrderBody, response: { 201: orderResponse }, operationId: 'createOrder' } }, async (r, reply) => reply.code(201).send(await controller.create(getAuthenticatedPrincipal(r).userId, r.body.quotationId)));
  api.get('/orders', { preHandler: customer, schema: { ...common, querystring: orderPage, response: { 200: Type.Array(orderResponse) }, operationId: 'listCustomerOrders' } }, async (r) => controller.list(getAuthenticatedPrincipal(r).userId, 'CUSTOMER', r.query.offset ?? 0, r.query.limit ?? 20));
  api.get('/orders/:orderId', { preHandler: customer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'getCustomerOrder' } }, async (r) => controller.get(getAuthenticatedPrincipal(r).userId, 'CUSTOMER', r.params.orderId));
  api.get('/procurer-services/me/orders', { preHandler: procurer, schema: { ...common, querystring: orderPage, response: { 200: Type.Array(orderResponse) }, operationId: 'listProcurerOrders' } }, async (r) => controller.list(getAuthenticatedPrincipal(r).userId, 'PROCURER', r.query.offset ?? 0, r.query.limit ?? 20));
  api.get('/procurer-services/me/orders/:orderId', { preHandler: procurer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'getProcurerOrder' } }, async (r) => controller.get(getAuthenticatedPrincipal(r).userId, 'PROCURER', r.params.orderId));
  api.post('/procurer-services/me/orders/:orderId/start', { preHandler: procurer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'startProcurement' } }, async (r) => controller.transition(getAuthenticatedPrincipal(r).userId, 'PROCURER', r.params.orderId, 'START'));
  api.post('/procurer-services/me/orders/:orderId/report-delivery', { preHandler: procurer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'reportOrderDelivery' } }, async (r) => controller.transition(getAuthenticatedPrincipal(r).userId, 'PROCURER', r.params.orderId, 'REPORT_DELIVERY'));
  api.post('/procurer-services/me/orders/:orderId/dispute', { preHandler: procurer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'disputeProcurerOrder' } }, async (r) => controller.transition(getAuthenticatedPrincipal(r).userId, 'PROCURER', r.params.orderId, 'DISPUTE'));
  api.post('/orders/:orderId/confirm-completion', { preHandler: customer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'confirmOrderCompletion' } }, async (r) => controller.transition(getAuthenticatedPrincipal(r).userId, 'CUSTOMER', r.params.orderId, 'CONFIRM_COMPLETION'));
  api.post('/orders/:orderId/dispute', { preHandler: customer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'disputeCustomerOrder' } }, async (r) => controller.transition(getAuthenticatedPrincipal(r).userId, 'CUSTOMER', r.params.orderId, 'DISPUTE'));
  api.post('/orders/:orderId/cancel', { preHandler: customer, schema: { ...common, params: orderParams, response: { 200: orderResponse }, operationId: 'cancelCustomerOrder' } }, async (r) => controller.transition(getAuthenticatedPrincipal(r).userId, 'CUSTOMER', r.params.orderId, 'CANCEL'));
};
