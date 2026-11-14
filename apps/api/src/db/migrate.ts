import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { loadEnv } from '../schemas/env.js';
import { createDb, createPool } from './client.js';

const migrationsFolder = fileURLToPath(
  new URL('../../drizzle', import.meta.url)
);

const pool = createPool(loadEnv());
try {
  await migrate(createDb(pool), { migrationsFolder });
  console.log('migrations applied');
} finally {
  await pool.end();
}
