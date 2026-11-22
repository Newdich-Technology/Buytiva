import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const databaseConnectionString = process.env.DATABASE_URL;

if (!databaseConnectionString) {
  throw new Error('DATABASE_URL must be set before creating the Prisma client.');
}

const postgresAdapter = new PrismaPg({
  connectionString: databaseConnectionString
});

export const prismaClient = new PrismaClient({ adapter: postgresAdapter });