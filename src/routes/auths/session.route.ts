import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { AUTH_API_PATHS } from '../../constants/api.constants.js';
import { SessionController } from '../../controllers/auths/session.controller.js';
import type { AuthenticationApiOptions } from '../../apis/v1/auth.api.js';
import { refreshSessionBody } from '../../dtos/auths/auth.dto.js';
import { authSessionResponse, okResponse } from '../../dtos/auths/authResponse.dto.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal } from '../../middlewares/authenticate.middleware.js';

export const sessionRoute: FastifyPluginAsync<AuthenticationApiOptions> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new SessionController(options.authDependencies);
  const authenticate = createAuthenticateMiddleware(options.authDependencies);

  api.post(AUTH_API_PATHS.refresh, {
    schema: { body: refreshSessionBody, response: { 200: authSessionResponse }, tags: ['authentication'], operationId: 'refreshSession' }
  }, async (request) => controller.refresh(request.body.refreshToken));

  api.post(AUTH_API_PATHS.logout, {
    preHandler: authenticate,
    schema: { response: { 200: okResponse }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'logoutCurrentSession' }
  }, async (request) => {
    await controller.logout(getAuthenticatedPrincipal(request));
    return { ok: true as const };
  });

  api.post(AUTH_API_PATHS.logoutAll, {
    preHandler: authenticate,
    schema: { response: { 200: Type.Object({ loggedOut: Type.Literal(true), revokedCount: Type.Number() }) }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'logoutAllSessions' }
  }, async (request) => controller.logoutAll(getAuthenticatedPrincipal(request)));

  api.get(AUTH_API_PATHS.sessions, {
    preHandler: authenticate,
    schema: { response: { 200: Type.Array(Type.Object({ id: Type.String(), deviceLabel: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String(), lastUsedAt: Type.Union([Type.String(), Type.Null()]), expiresAt: Type.String() })) }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'listActiveSessions' }
  }, async (request) => controller.list(getAuthenticatedPrincipal(request)));

  api.delete(AUTH_API_PATHS.sessions + '/:sessionId', {
    preHandler: authenticate,
    schema: {
      params: Type.Object({ sessionId: Type.String({ format: 'uuid' }) }),
      response: { 200: okResponse },
      tags: ['authentication'],
      security: [{ bearerAuth: [] }],
      operationId: 'revokeSession'
    }
  }, async (request) => {
    await controller.revoke(getAuthenticatedPrincipal(request), request.params.sessionId);
    return { ok: true as const };
  });
};
