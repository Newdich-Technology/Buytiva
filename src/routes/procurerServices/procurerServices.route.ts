import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { ProcurerServicesController } from '../../controllers/procurerServices/procurerServices.controller.js';
import { profileInput, profileResponse, zoneInput, zoneParams, zoneResponse, discoveryQuery, publicProfileResponse, pricingInput, pricingResponse } from '../../dtos/procurerServices/procurerServices.dto.js';

interface Options { authDependencies: AuthDependencies; procurerServicesRepository: ProcurerServicesRepository }
export const procurerServicesRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new ProcurerServicesController(options.procurerServicesRepository);
  const auth = createAuthenticateMiddleware(options.authDependencies);
  const procurer = [auth, requireAuthenticatedRole(UserRole.PROCURER)];
  const customer = [auth, requireAuthenticatedRole(UserRole.CUSTOMER)];
  const common = { tags: ['procurer services'], security: [{ bearerAuth: [] }] };
  api.get('/procurer-services/me', { preHandler: procurer, schema: { ...common, response: { 200: profileResponse }, operationId: 'getOwnProcurerServices' } }, async (request) => controller.own(getAuthenticatedPrincipal(request).userId));
  api.put('/procurer-services/me', { preHandler: procurer, schema: { ...common, body: profileInput, response: { 200: profileResponse }, operationId: 'updateOwnProcurerServices' } }, async (request) => controller.update(getAuthenticatedPrincipal(request).userId, request.body));
  api.get('/procurer-services/me/pricing', { preHandler: procurer, schema: { ...common, response: { 200: Type.Union([pricingResponse, Type.Null()]) }, operationId: 'getOwnPricingPolicy' } }, async (request) => controller.pricing(getAuthenticatedPrincipal(request).userId));
  api.put('/procurer-services/me/pricing', { preHandler: procurer, schema: { ...common, body: pricingInput, response: { 200: pricingResponse }, operationId: 'updateOwnPricingPolicy' } }, async (request) => controller.updatePricing(getAuthenticatedPrincipal(request).userId, request.body));
  api.post('/procurer-services/me/zones', { preHandler: procurer, schema: { ...common, body: zoneInput, response: { 201: zoneResponse }, operationId: 'createProcurerServiceZone' } }, async (request, reply) => reply.code(201).send(await controller.saveZone(getAuthenticatedPrincipal(request).userId, request.body)));
  api.put('/procurer-services/me/zones/:zoneId', { preHandler: procurer, schema: { ...common, params: zoneParams, body: zoneInput, response: { 200: zoneResponse }, operationId: 'updateProcurerServiceZone' } }, async (request) => controller.saveZone(getAuthenticatedPrincipal(request).userId, request.body, request.params.zoneId));
  api.get('/procurers/discovery', { preHandler: customer, schema: { ...common, querystring: discoveryQuery, response: { 200: Type.Array(publicProfileResponse) }, operationId: 'discoverEligibleProcurers' } }, async (request) => controller.discover({ ...request.query, offset: request.query.offset ?? 0, limit: request.query.limit ?? 20 }));
};
