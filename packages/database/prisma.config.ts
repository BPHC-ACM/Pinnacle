/// <reference types="node" />
import 'dotenv/config';

export default {
  datasource: {
    url: "postgresql://postgres:password@localhost:5433/pinnacle?schema=public",
  },
  migrations: {
    seed: 'pnpm ts-node ./prisma/seed.ts',
  },
};
