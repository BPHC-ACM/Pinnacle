/// <reference types="node" />
import 'dotenv/config';

export default {
  migrations: {
    seed: 'pnpm tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
