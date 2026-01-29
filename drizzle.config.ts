import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const isLocalDev = !process.env.TURSO_DATABASE_URL ||
                   process.env.TURSO_DATABASE_URL === 'file:local.db';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: isLocalDev
    ? {
        url: 'file:local.db',
      }
    : {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
});
