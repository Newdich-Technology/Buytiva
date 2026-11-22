import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './apis/v1/registerRoutes.js';
import { registerErrorMapper } from './errors/errorMapper.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import { openApiDocumentOptions } from './configs/swagger.config.js';
import { AUTH_GLOBAL_RATE_LIMIT_PER_MINUTE, AUTH_RATE_WINDOW_MS } from './constants/auths/auth.constants.js';
import { OPENAPI_ROUTE_PREFIX } from './constants/api.constants.js';
import { registerAuthenticationRequestContext } from './middlewares/authenticate.middleware.js';
import type { AuthDependencies } from './types/authDependencies.type.js';

export function createBuytivaFastifyApplication(options: { authDependencies?: AuthDependencies } = {}): FastifyInstance {
  const app = Fastify({ logger: true });
  registerErrorMapper(app);
  app.register(rateLimit, { global: true, max: AUTH_GLOBAL_RATE_LIMIT_PER_MINUTE, timeWindow: AUTH_RATE_WINDOW_MS });
  app.register(swagger, openApiDocumentOptions);
  app.register(swaggerUi, { routePrefix: OPENAPI_ROUTE_PREFIX, uiConfig: { docExpansion: 'list' } });
  registerAuthenticationRequestContext(app);
  app.register(registerRoutes, options);
  return app;
}
