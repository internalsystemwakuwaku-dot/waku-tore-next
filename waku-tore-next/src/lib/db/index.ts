import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Determine if we're in local development mode
const isLocalDev = !process.env.TURSO_DATABASE_URL ||
                   process.env.TURSO_DATABASE_URL === 'file:local.db';

// Create libSQL client
const client = createClient(
  isLocalDev
    ? {
        // Local SQLite file for development
        url: 'file:local.db',
      }
    : {
        // Turso cloud database for production
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export { schema };

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    await client.execute('SELECT 1');
    return { connected: true, error: null, isLocal: isLocalDev };
  } catch (error) {
    return { connected: false, error: String(error), isLocal: isLocalDev };
  }
}
