import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { databaseConfigurationError } from '../errors/database.error.js';

const databaseConnectionString = process.env.DATABASE_URL;

if (!databaseConnectionString) {
  throw databaseConfigurationError();
}

const postgresAdapter = new PrismaPg({
  connectionString: databaseConnectionString
});

export const prismaClient = new PrismaClient({ adapter: postgresAdapter });
