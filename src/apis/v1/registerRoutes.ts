import type { FastifyPluginAsync } from 'fastify';
import { API_VERSION_PREFIX } from '../../constants/api.constants.js';
import { healthRoute } from '../../routes/health/health.route.js';

export const registerRoutes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoute, { prefix: API_VERSION_PREFIX });
};
