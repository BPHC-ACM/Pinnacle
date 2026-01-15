/// <reference types="node" />
import 'dotenv/config';

export default {
  migrations: {
    seed: 'pnpm ts-node ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
