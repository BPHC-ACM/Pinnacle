import { PrismaClient, Prisma } from '@prisma/client';

import { logger } from '../config/logger.config';

const prisma = new PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'>({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: e.duration }, 'Database query executed');
  });
}

prisma.$on('error', (e: { message: string }) => {
  logger.error({ message: e.message }, 'Database error');
});

prisma.$on('warn', (e: { message: string }) => {
  logger.warn({ message: e.message }, 'Database warning');
});

logger.info('Prisma client initialized');

export default prisma;
