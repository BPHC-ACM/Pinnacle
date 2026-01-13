import { config } from 'dotenv';
import { join } from 'path';

// Load .env from root directory (parent of backend) BEFORE importing Prisma config
config({ path: join(process.cwd(), '../.env') });
config({ path: join(process.cwd(), '.env') });

// Now import and use the env after dotenv is loaded
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
