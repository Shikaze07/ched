import "dotenv/config";
import type { PoolConfig } from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const required = ['DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME', 'DATABASE_PORT'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

const dbConfig: PoolConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: parseInt(process.env.DATABASE_PORT as string, 10),
  connectionLimit: process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE, 10) : 10,
  // Remote Railway DB needs more time to acquire/establish connections
  acquireTimeout: 30000,   // 30s to get a connection from pool
  connectTimeout: 20000,   // 20s to establish a new TCP connection
  idleTimeout: 60000,      // Keep idle connections alive for 60s
  minimumIdle: 2,          // Always keep 2 connections warm
};

const adapter = new PrismaMariaDb(dbConfig);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

export { prisma };
