import type { FastifyPluginAsync } from 'fastify';
import { API_VERSION_PREFIX } from '../../constants/api.constants.js';
import { healthRoute } from '../../routes/health/health.route.js';
import { registerAuthenticationApi } from './auth.api.js';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { ShoppingListRepository } from '../../interfaces/shoppingLists/shoppingListRepository.interface.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { procurerServicesRoute } from '../../routes/procurerServices/procurerServices.route.js';
import { shoppingListRoute } from '../../routes/shoppingLists/shoppingList.route.js';

export interface VersionedApiOptions {
  readonly authDependencies?: AuthDependencies;
  readonly shoppingListRepository?: ShoppingListRepository;
  readonly procurerServicesRepository?: ProcurerServicesRepository;
}

export const registerRoutes: FastifyPluginAsync<VersionedApiOptions> = async (app, options) => {
  await app.register(healthRoute, { prefix: API_VERSION_PREFIX });
  if (options.authDependencies) {
    await app.register(registerAuthenticationApi, {
      prefix: API_VERSION_PREFIX,
      authDependencies: options.authDependencies
    });
    if (options.procurerServicesRepository) await app.register(procurerServicesRoute, { prefix: API_VERSION_PREFIX, authDependencies: options.authDependencies, procurerServicesRepository: options.procurerServicesRepository });
    if (options.shoppingListRepository) {
      await app.register(shoppingListRoute, { prefix: API_VERSION_PREFIX, authDependencies: options.authDependencies, shoppingListRepository: options.shoppingListRepository });
    }
  }
};
