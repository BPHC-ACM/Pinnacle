import { PrismaClient, Prisma } from '@pinnacle/types';

import { logger } from '../config/logger.config';

const prismaInstance = new PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'>({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prismaInstance.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: e.duration }, 'Database query executed');
  });
}

prismaInstance.$on('error', (e: { message: string }) => {
  logger.error({ message: e.message }, 'Database error');
});

prismaInstance.$on('warn', (e: { message: string }) => {
  logger.warn({ message: e.message }, 'Database warning');
});

logger.info('Prisma client initialized');

const prisma: PrismaClient = prismaInstance;

export default prisma;
