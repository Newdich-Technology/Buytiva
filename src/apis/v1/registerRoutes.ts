import type { FastifyPluginAsync } from 'fastify';
import { API_VERSION_PREFIX } from '../../constants/api.constants.js';
import { healthRoute } from '../../routes/health/health.route.js';
import { registerAuthenticationApi } from './auth.api.js';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { ShoppingListRepository } from '../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import { shoppingListRoute } from '../../routes/shoppingLists/shoppingList.route.js';

export interface VersionedApiOptions {
  readonly authDependencies?: AuthDependencies;
  readonly shoppingListRepository?: ShoppingListRepository;
}

export const registerRoutes: FastifyPluginAsync<VersionedApiOptions> = async (app, options) => {
  await app.register(healthRoute, { prefix: API_VERSION_PREFIX });
  if (options.authDependencies) {
    await app.register(registerAuthenticationApi, {
      prefix: API_VERSION_PREFIX,
      authDependencies: options.authDependencies
    });
    if (options.shoppingListRepository) {
      await app.register(shoppingListRoute, { prefix: API_VERSION_PREFIX, authDependencies: options.authDependencies, shoppingListRepository: options.shoppingListRepository });
    }
  }
};
