import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { ShoppingListRepository } from '../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { createListBody, itemBody, itemParams, listParams, listQuery, listResponse } from '../../dtos/shoppingLists/shoppingList.dto.js';
import { createShoppingListCommand } from '../../services/shoppingLists/commands/createShoppingList.command.js';
import { changeShoppingListCommand } from '../../services/shoppingLists/commands/changeShoppingList.command.js';
import { deleteShoppingListCommand } from '../../services/shoppingLists/commands/deleteShoppingList.command.js';
import { getShoppingListQuery } from '../../services/shoppingLists/queries/getShoppingList.query.js';
import { listShoppingListsQuery } from '../../services/shoppingLists/queries/listShoppingLists.query.js';

interface Options { authDependencies: AuthDependencies; shoppingListRepository: ShoppingListRepository }
export const shoppingListRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const repo = options.shoppingListRepository;
  const guards = [createAuthenticateMiddleware(options.authDependencies), requireAuthenticatedRole(UserRole.CUSTOMER)];
  const common = { tags: ['shopping lists'], security: [{ bearerAuth: [] }] };
  api.post('/shopping-lists', { preHandler: guards, schema: { ...common, body: createListBody, response: { 201: listResponse }, operationId: 'createShoppingList' } },
    async (request, reply) => reply.code(201).send(await createShoppingListCommand(repo, getAuthenticatedPrincipal(request).userId, request.body)));
  api.get('/shopping-lists', { preHandler: guards, schema: { ...common, querystring: listQuery, response: { 200: Type.Array(listResponse) }, operationId: 'listShoppingLists' } },
    async (request) => listShoppingListsQuery(repo, getAuthenticatedPrincipal(request).userId, request.query.offset ?? 0, request.query.limit ?? 20));
  api.get('/shopping-lists/:listId', { preHandler: guards, schema: { ...common, params: listParams, response: { 200: listResponse }, operationId: 'getShoppingList' } },
    async (request) => getShoppingListQuery(repo, getAuthenticatedPrincipal(request).userId, request.params.listId));
  api.post('/shopping-lists/:listId/items', { preHandler: guards, schema: { ...common, params: listParams, body: itemBody, response: { 200: listResponse }, operationId: 'addShoppingListItem' } },
    async (request) => changeShoppingListCommand(repo, getAuthenticatedPrincipal(request).userId, request.params.listId, { type: 'add', input: request.body }));
  api.put('/shopping-lists/:listId/items/:itemId', { preHandler: guards, schema: { ...common, params: itemParams, body: itemBody, response: { 200: listResponse }, operationId: 'updateShoppingListItem' } },
    async (request) => changeShoppingListCommand(repo, getAuthenticatedPrincipal(request).userId, request.params.listId, { type: 'edit', id: request.params.itemId, input: request.body }));
  api.delete('/shopping-lists/:listId/items/:itemId', { preHandler: guards, schema: { ...common, params: itemParams, response: { 200: listResponse }, operationId: 'removeShoppingListItem' } },
    async (request) => changeShoppingListCommand(repo, getAuthenticatedPrincipal(request).userId, request.params.listId, { type: 'remove', id: request.params.itemId }));
  api.post('/shopping-lists/:listId/submit', { preHandler: guards, schema: { ...common, params: listParams, response: { 200: listResponse }, operationId: 'submitShoppingList' } },
    async (request) => changeShoppingListCommand(repo, getAuthenticatedPrincipal(request).userId, request.params.listId, { type: 'submit' }));
  api.delete('/shopping-lists/:listId', { preHandler: guards, schema: { ...common, params: listParams, response: { 200: Type.Object({ deleted: Type.Literal(true) }) }, operationId: 'deleteShoppingList' } },
    async (request) => deleteShoppingListCommand(repo, getAuthenticatedPrincipal(request).userId, request.params.listId));
};
