import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { AUTH_API_PATHS } from '../../constants/api.constants.js';
import { MfaController } from '../../controllers/auths/mfa.controller.js';
import type { AuthenticationApiOptions } from '../../apis/v1/auth.api.js';
import { disableMfaBody, enrollTotpBody, verifyTotpEnrollmentBody } from '../../dtos/auths/auth.dto.js';
import { createAuthenticateMiddleware, createOptionalAuthenticateMiddleware, getAuthenticatedPrincipal } from '../../middlewares/authenticate.middleware.js';

export const mfaRoute: FastifyPluginAsync<AuthenticationApiOptions> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new MfaController(options.authDependencies);
  const authenticate = createAuthenticateMiddleware(options.authDependencies);
  const optionalAuthenticate = createOptionalAuthenticateMiddleware(options.authDependencies);

  api.post(AUTH_API_PATHS.enrollTotp, {
    preHandler: optionalAuthenticate,
    schema: { body: enrollTotpBody, response: { 200: Type.Object({ enrollmentRequired: Type.Literal(true), secret: Type.String(), authenticatorUri: Type.String(), challengeExpiresInMinutes: Type.Union([Type.Number(), Type.Null()]) }) }, tags: ['authentication'], operationId: 'enrollTotpAuthenticator' }
  }, async (request) => controller.enroll(request.authPrincipal, request.body));

  api.post(AUTH_API_PATHS.verifyTotp, {
    preHandler: optionalAuthenticate,
    schema: { body: verifyTotpEnrollmentBody, response: { 200: Type.Record(Type.String(), Type.Unknown()) }, tags: ['authentication'], operationId: 'verifyTotpEnrollment' }
  }, async (request) => controller.verifyEnrollment(request.authPrincipal, request.body));

  api.get(AUTH_API_PATHS.mfaStatus, {
    preHandler: authenticate,
    schema: { response: { 200: Type.Object({ enabled: Type.Boolean() }) }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'getMfaStatus' }
  }, async (request) => controller.status(getAuthenticatedPrincipal(request)));

  api.post(AUTH_API_PATHS.disableTotp, {
    preHandler: authenticate,
    schema: { body: disableMfaBody, response: { 200: Type.Object({ mfaDisabled: Type.Literal(true), signInAgain: Type.Literal(true) }) }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'disableTotpAuthenticator' }
  }, async (request) => controller.disable(getAuthenticatedPrincipal(request), request.body));
};
