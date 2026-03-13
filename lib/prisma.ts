import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = {
  prismaAdapter: PrismaMariaDb | undefined;
  prisma: PrismaClient | undefined;
};

const globalForPrisma = globalThis as unknown as GlobalWithPrisma;

// Map env vars - using DATABASE_ prefix to match existing .env while adopting persistence pattern
const host = process.env.DATABASE_HOST || process.env.DB_HOST;
const user = process.env.DATABASE_USER || process.env.DB_USER;
const password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;
const database = process.env.DATABASE_NAME || process.env.DB_NAME;
const port = parseInt((process.env.DATABASE_PORT || process.env.DB_PORT || "3306") as string, 10);

// Persist the adapter globally so HMR doesn't create a new connection pool each reload
const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaMariaDb({
    host: host!,
    user: user!,
    password: password!,
    database: database!,
    port: port,
    connectionLimit: 20,
    acquireTimeout: 30000,
    connectTimeout: 20000,
  });

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error']
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = prisma;
}

export { prisma };
