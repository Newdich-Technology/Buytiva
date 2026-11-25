import 'dotenv/config';
import pino from 'pino';
import { DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT } from './constants/app.constants.js';
import { createBuytivaFastifyApplication } from './app.js';
import { prismaClient } from './databases/prismaClient.js';
import { PrismaProcurerServicesRepository } from './repositories/procurerServices/procurerServices.repository.js';
import { PrismaOrderRepository } from './repositories/orders/order.repository.js';
import { PrismaQuotationRepository } from './repositories/quotations/quotation.repository.js';
import { PrismaShoppingRequestRepository } from './repositories/shoppingRequests/shoppingRequest.repository.js';
import { PrismaAddressRepository } from './repositories/addresses/address.repository.js';
import { PrismaShoppingListRepository } from './repositories/shoppingLists/shoppingList.repository.js';
import { createAuthRuntime, startAuthEmailOutboxPolling } from './loaders/auth.loader.js';

const logger = pino();
const port = Number(process.env.PORT ?? DEFAULT_SERVER_PORT);
const host = process.env.HOST ?? DEFAULT_SERVER_HOST;

let app: ReturnType<typeof createBuytivaFastifyApplication> | undefined;
try {
  await prismaClient.$connect();
  const runtime = createAuthRuntime(prismaClient, logger);
  app = createBuytivaFastifyApplication({ authDependencies: runtime.dependencies, orderRepository: new PrismaOrderRepository(prismaClient), quotationRepository: new PrismaQuotationRepository(prismaClient), shoppingRequestRepository: new PrismaShoppingRequestRepository(prismaClient), addressRepository: new PrismaAddressRepository(prismaClient), shoppingListRepository: new PrismaShoppingListRepository(prismaClient), procurerServicesRepository: new PrismaProcurerServicesRepository(prismaClient) });
  const emailPollingTimer = startAuthEmailOutboxPolling(runtime.emailOutboxJob, logger);
  app.addHook('onClose', async () => { clearInterval(emailPollingTimer); await prismaClient.$disconnect(); });
  const shutdown = () => { void app?.close().catch(() => { logger.error({ event: 'SERVER_SHUTDOWN_FAILURE' }); process.exitCode = 1; }); };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  await app.listen({ port, host });
} catch (error) {
  logger.error({ event: 'SERVER_START_FAILURE' });
  if (app) await app.close().catch(() => undefined);
  await prismaClient.$disconnect().catch(() => undefined);
  process.exitCode = 1;
}
