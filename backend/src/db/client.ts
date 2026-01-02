import { PrismaClient, Prisma } from '@pinnacle/types';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { logger } from '../config/logger.config';

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prismaInstance = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prismaInstance.$on('query', (e: Prisma.QueryEvent) => {
    logger.debug({ query: e.query, duration: e.duration }, 'Database query executed');
  });
}

prismaInstance.$on('error', (e: Prisma.LogEvent) => {
  logger.error({ message: e.message }, 'Database error');
});

prismaInstance.$on('warn', (e: Prisma.LogEvent) => {
  logger.warn({ message: e.message }, 'Database warning');
});

logger.info('Prisma client initialized');

const prisma: PrismaClient = prismaInstance;

export default prisma;
