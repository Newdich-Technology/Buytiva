import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { AUTH_API_PATHS } from '../../constants/api.constants.js';
import { AUTH_LOGIN_RATE_LIMIT_PER_MINUTE, AUTH_OTP_RATE_LIMIT_PER_MINUTE, AUTH_RATE_WINDOW_MS } from '../../constants/auths/auth.constants.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { AuthController } from '../../controllers/auths/auth.controller.js';
import type { AuthenticationApiOptions } from '../../apis/v1/auth.api.js';
import { changePasswordBody, updateCustomerProfileBody, completeLoginBody, emailBody, loginBody, registerUserBody, resetPasswordBody, verifyEmailOtpBody } from '../../dtos/auths/auth.dto.js';
import { acceptedResponse, authSessionResponse, loginResponse, okResponse } from '../../dtos/auths/authResponse.dto.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';

export const authRoute: FastifyPluginAsync<AuthenticationApiOptions> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new AuthController(options.authDependencies);
  const authenticate = createAuthenticateMiddleware(options.authDependencies);

  api.post(AUTH_API_PATHS.register, {
    config: { rateLimit: { max: AUTH_OTP_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: registerUserBody, response: { 202: acceptedResponse }, tags: ['authentication'], operationId: 'registerCustomer' }
  }, async (request, reply) => reply.code(202).send(await controller.register(request.body)));

  api.post(AUTH_API_PATHS.resendEmailOtp, {
    config: { rateLimit: { max: AUTH_OTP_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: emailBody, response: { 202: acceptedResponse }, tags: ['authentication'], operationId: 'resendEmailVerificationOtp' }
  }, async (request, reply) => reply.code(202).send(await controller.requestEmailOtp(request.body.email)));

  api.post(AUTH_API_PATHS.verifyEmailOtp, {
    config: { rateLimit: { max: AUTH_OTP_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: verifyEmailOtpBody, response: { 200: Type.Object({ verified: Type.Literal(true) }) }, tags: ['authentication'], operationId: 'verifyEmailOtp' }
  }, async (request) => controller.verifyEmailOtp(request.body));

  api.post(AUTH_API_PATHS.login, {
    config: { rateLimit: { max: AUTH_LOGIN_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: loginBody, response: { 200: loginResponse }, tags: ['authentication'], operationId: 'loginUser' }
  }, async (request) => controller.login({ ...request.body, deviceLabel: request.body.deviceLabel ?? request.headers['user-agent']?.slice(0, 80) }));

  api.post(AUTH_API_PATHS.completeLogin, {
    config: { rateLimit: { max: AUTH_LOGIN_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: completeLoginBody, response: { 200: authSessionResponse }, tags: ['authentication'], operationId: 'completeLoginChallenge' }
  }, async (request) => controller.completeLogin({ ...request.body, deviceLabel: request.body.deviceLabel ?? request.headers['user-agent']?.slice(0, 80) }));

  api.post(AUTH_API_PATHS.forgotPassword, {
    config: { rateLimit: { max: AUTH_OTP_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: emailBody, response: { 202: acceptedResponse }, tags: ['authentication'], operationId: 'requestPasswordReset' }
  }, async (request, reply) => reply.code(202).send(await controller.requestPasswordReset(request.body.email)));

  api.post(AUTH_API_PATHS.resetPassword, {
    config: { rateLimit: { max: AUTH_LOGIN_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { body: resetPasswordBody, response: { 200: Type.Object({ passwordReset: Type.Literal(true) }) }, tags: ['authentication'], operationId: 'resetPassword' }
  }, async (request) => controller.resetPassword(request.body));

  api.post(AUTH_API_PATHS.changePassword, {
    preHandler: authenticate,
    schema: { body: changePasswordBody, response: { 200: Type.Object({ passwordChanged: Type.Literal(true), signInAgain: Type.Literal(true) }) }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'changePassword' }
  }, async (request) => controller.changePassword(getAuthenticatedPrincipal(request).userId, request.body));

  api.patch(AUTH_API_PATHS.currentUser, {
    preHandler: [authenticate, requireAuthenticatedRole(UserRole.CUSTOMER)],
    schema: { body: updateCustomerProfileBody, response: { 200: Type.Object({ displayName: Type.String() }) }, tags: ['customer profile'], security: [{ bearerAuth: [] }], operationId: 'updateCustomerProfile' }
  }, async (request) => controller.updateCustomerProfile(getAuthenticatedPrincipal(request).userId, request.body.displayName));

  api.get(AUTH_API_PATHS.currentUser, {
    preHandler: authenticate,
    schema: { response: { 200: Type.Record(Type.String(), Type.Unknown()) }, tags: ['authentication'], security: [{ bearerAuth: [] }], operationId: 'getCurrentUser' }
  }, async (request) => controller.currentUser(getAuthenticatedPrincipal(request)));
};
