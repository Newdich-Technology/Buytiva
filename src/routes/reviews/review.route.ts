import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { ReviewRepository } from '../../interfaces/reviews/reviewRepository.interface.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole } from '../../middlewares/authenticate.middleware.js';
import { AUTH_RATE_WINDOW_MS } from '../../constants/auths/auth.constants.js';
import { REVIEW_CREATE_RATE_LIMIT_PER_MINUTE } from '../../constants/reviews/review.constants.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { ReviewController } from '../../controllers/reviews/review.controller.js';
import { reviewBody, reviewParams, reviewResponse } from '../../dtos/reviews/review.dto.js';
interface Options { authDependencies: AuthDependencies; reviewRepository: ReviewRepository }
export const reviewRoute: FastifyPluginAsync<Options> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new ReviewController(options.reviewRepository);
  const customer = [createAuthenticateMiddleware(options.authDependencies), requireAuthenticatedRole(UserRole.CUSTOMER)];
  const common = { tags: ['reviews'], security: [{ bearerAuth: [] }] };
  api.post('/orders/:orderId/review', { preHandler: customer, config: { rateLimit: { max: REVIEW_CREATE_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS } },
    schema: { ...common, params: reviewParams, body: reviewBody, response: { 201: reviewResponse }, operationId: 'createOrderReview' } },
  async (request, reply) => reply.code(201).send(await controller.create(getAuthenticatedPrincipal(request).userId, request.params.orderId,
    { rating: request.body.rating, comment: request.body.comment ?? null })));
  api.get('/orders/:orderId/review', { preHandler: customer, schema: { ...common, params: reviewParams, response: { 200: reviewResponse }, operationId: 'getOwnOrderReview' } },
    async (request) => controller.getOwn(getAuthenticatedPrincipal(request).userId, request.params.orderId));
};
