/// <reference types="node" />
import 'dotenv/config';

export default {
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5433/pinnacle?schema=public",
  },
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
};
