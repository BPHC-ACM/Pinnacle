/// <reference types="node" />
import 'dotenv/config';

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'pnpm tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
