import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { QuotationRepository } from '../../interfaces/quotations/quotationRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { QuotationController } from '../../controllers/quotations/quotation.controller.js';
import { issueQuoteBody, quoteParams, requestParams, quoteResponse } from '../../dtos/quotations/quotation.dto.js';
interface Options { authDependencies: AuthDependencies; quotationRepository: QuotationRepository }
export const quotationRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new QuotationController(options.quotationRepository);
  const auth = createAuthenticateMiddleware(options.authDependencies);
  const customer = [auth, requireAuthenticatedRole(UserRole.CUSTOMER)];
  const procurer = [auth, requireAuthenticatedRole(UserRole.PROCURER)];
  const common = { tags: ['quotations'], security: [{ bearerAuth: [] }] };
  api.post('/procurer-services/me/requests/:requestId/quotations', { preHandler: procurer, schema: { ...common, params: requestParams, body: issueQuoteBody, response: { 201: quoteResponse }, operationId: 'issueQuotation' } }, async (request, reply) => reply.code(201).send(await controller.issue(getAuthenticatedPrincipal(request).userId, { ...request.body, requestId: request.params.requestId })));
  api.get('/procurer-services/me/requests/:requestId/quotations', { preHandler: procurer, schema: { ...common, params: requestParams, response: { 200: Type.Array(quoteResponse) }, operationId: 'listProcurerQuotations' } }, async (request) => controller.list(getAuthenticatedPrincipal(request).userId, 'PROCURER', request.params.requestId));
  api.get('/procurer-services/me/quotations/:quotationId', { preHandler: procurer, schema: { ...common, params: quoteParams, response: { 200: quoteResponse }, operationId: 'getProcurerQuotation' } }, async (request) => controller.get(getAuthenticatedPrincipal(request).userId, 'PROCURER', request.params.quotationId));
  api.get('/shopping-requests/:requestId/quotations', { preHandler: customer, schema: { ...common, params: requestParams, response: { 200: Type.Array(quoteResponse) }, operationId: 'listCustomerQuotations' } }, async (request) => controller.list(getAuthenticatedPrincipal(request).userId, 'CUSTOMER', request.params.requestId));
  api.get('/quotations/:quotationId', { preHandler: customer, schema: { ...common, params: quoteParams, response: { 200: quoteResponse }, operationId: 'getCustomerQuotation' } }, async (request) => controller.get(getAuthenticatedPrincipal(request).userId, 'CUSTOMER', request.params.quotationId));
  api.post('/quotations/:quotationId/accept', { preHandler: customer, schema: { ...common, params: quoteParams, response: { 200: quoteResponse }, operationId: 'acceptQuotation' } }, async (request) => controller.decide(getAuthenticatedPrincipal(request).userId, request.params.quotationId, 'ACCEPTED'));
  api.post('/quotations/:quotationId/reject', { preHandler: customer, schema: { ...common, params: quoteParams, response: { 200: quoteResponse }, operationId: 'rejectQuotation' } }, async (request) => controller.decide(getAuthenticatedPrincipal(request).userId, request.params.quotationId, 'REJECTED'));
};
