import type { FastifyPluginAsync } from 'fastify';
import { API_VERSION_PREFIX } from '../../constants/api.constants.js';
import { healthRoute } from '../../routes/health/health.route.js';
import { registerAuthenticationApi } from './auth.api.js';
import type { AuthDependencies } from '../../types/authDependencies.type.js';

export interface VersionedApiOptions {
  readonly authDependencies?: AuthDependencies;
}

export const registerRoutes: FastifyPluginAsync<VersionedApiOptions> = async (app, options) => {
  await app.register(healthRoute, { prefix: API_VERSION_PREFIX });
  if (options.authDependencies) {
    await app.register(registerAuthenticationApi, {
      prefix: API_VERSION_PREFIX,
      authDependencies: options.authDependencies
    });
  }
};
