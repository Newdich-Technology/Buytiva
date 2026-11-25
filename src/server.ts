import 'dotenv/config';
import pino from 'pino';
import { DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT } from './constants/app.constants.js';
import { createBuytivaFastifyApplication } from './app.js';
import { prismaClient } from './databases/prismaClient.js';
import { PrismaProcurerServicesRepository } from './repositories/procurerServices/procurerServices.repository.js';
import { PrismaAddressRepository } from './repositories/addresses/address.repository.js';
import { PrismaShoppingListRepository } from './repositories/shoppingLists/shoppingList.repository.js';
import { createAuthRuntime, startAuthEmailOutboxPolling } from './loaders/auth.loader.js';

const logger = pino();
const port = Number(process.env.PORT ?? DEFAULT_SERVER_PORT);
const host = process.env.HOST ?? DEFAULT_SERVER_HOST;

try {
  const runtime = createAuthRuntime(prismaClient, logger);
  const app = createBuytivaFastifyApplication({ authDependencies: runtime.dependencies, addressRepository: new PrismaAddressRepository(prismaClient), shoppingListRepository: new PrismaShoppingListRepository(prismaClient), procurerServicesRepository: new PrismaProcurerServicesRepository(prismaClient) });
  const emailPollingTimer = startAuthEmailOutboxPolling(runtime.emailOutboxJob, logger);
  app.addHook('onClose', async () => clearInterval(emailPollingTimer));
  await app.listen({ port, host });
} catch (error) {
  logger.error({ event: 'SERVER_START_FAILURE' });
  process.exitCode = 1;
}
