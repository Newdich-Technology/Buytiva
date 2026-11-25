import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { AddressRepository } from '../../interfaces/addresses/addressRepository.interface.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { AddressController } from '../../controllers/addresses/address.controller.js';
import { addressBody, addressParams, addressPage, addressResponse } from '../../dtos/addresses/address.dto.js';
import { publicProfileResponse } from '../../dtos/procurerServices/procurerServices.dto.js';
interface Options { authDependencies: AuthDependencies; addressRepository: AddressRepository; procurerServicesRepository: ProcurerServicesRepository }
export const addressRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new AddressController(options.addressRepository, options.procurerServicesRepository);
  const guards = [createAuthenticateMiddleware(options.authDependencies), requireAuthenticatedRole(UserRole.CUSTOMER)];
  const common = { tags: ['customer addresses'], security: [{ bearerAuth: [] }] };
  api.post('/addresses', { preHandler: guards, schema: { ...common, body: addressBody, response: { 201: addressResponse }, operationId: 'createCustomerAddress' } }, async (request, reply) => reply.code(201).send(await controller.save(getAuthenticatedPrincipal(request).userId, request.body)));
  api.get('/addresses', { preHandler: guards, schema: { ...common, querystring: addressPage, response: { 200: Type.Array(addressResponse) }, operationId: 'listCustomerAddresses' } }, async (request) => controller.list(getAuthenticatedPrincipal(request).userId, request.query.offset ?? 0, request.query.limit ?? 20));
  api.get('/addresses/:addressId', { preHandler: guards, schema: { ...common, params: addressParams, response: { 200: addressResponse }, operationId: 'getCustomerAddress' } }, async (request) => controller.get(getAuthenticatedPrincipal(request).userId, request.params.addressId));
  api.put('/addresses/:addressId', { preHandler: guards, schema: { ...common, params: addressParams, body: addressBody, response: { 200: addressResponse }, operationId: 'updateCustomerAddress' } }, async (request) => controller.save(getAuthenticatedPrincipal(request).userId, request.body, request.params.addressId));
  api.delete('/addresses/:addressId', { preHandler: guards, schema: { ...common, params: addressParams, response: { 200: Type.Object({ deleted: Type.Literal(true) }) }, operationId: 'deleteCustomerAddress' } }, async (request) => controller.delete(getAuthenticatedPrincipal(request).userId, request.params.addressId));
  api.get('/addresses/:addressId/procurers', { preHandler: guards, schema: { ...common, params: addressParams, querystring: addressPage, response: { 200: Type.Array(publicProfileResponse) }, operationId: 'discoverProcurersForAddress' } }, async (request) => controller.discover(getAuthenticatedPrincipal(request).userId, request.params.addressId, request.query.offset ?? 0, request.query.limit ?? 20));
};
