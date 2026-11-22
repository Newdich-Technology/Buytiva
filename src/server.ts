import { DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT } from './constants/app.constants.js';
import { createBuytivaFastifyApplication } from './app.js';

const app = createBuytivaFastifyApplication();
const port = Number(process.env.PORT ?? DEFAULT_SERVER_PORT);
const host = process.env.HOST ?? DEFAULT_SERVER_HOST;

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
