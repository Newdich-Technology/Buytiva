import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './apis/v1/registerRoutes.js';
import { registerErrorMapper } from './errors/errorMapper.js';

export function createBuytivaFastifyApplication(): FastifyInstance {
  const app = Fastify({ logger: true });
  registerErrorMapper(app);
  app.register(registerRoutes);
  return app;
}
