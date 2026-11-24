import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { Pool } from 'pg';
import { loadEnv } from '../schemas/env.js';
import { createDb, createPool } from './client.js';

const WAIT_FOR_DB_MS = 30_000;
const RETRY_DELAY_MS = 1_000;

const migrationsFolder = fileURLToPath(
  new URL('../../drizzle', import.meta.url)
);

// Not every compose tool waits for the db healthcheck (podman-compose), and
// on a fresh volume Postgres restarts once after its init: retry until then.
async function waitForDatabase(pool: Pool, deadline: number): Promise<void> {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    if (Date.now() >= deadline) {
      throw err;
    }
    console.log('database not reachable yet, retrying ...');
    await sleep(RETRY_DELAY_MS);
    await waitForDatabase(pool, deadline);
  }
}

const pool = createPool(loadEnv());
try {
  await waitForDatabase(pool, Date.now() + WAIT_FOR_DB_MS);
  await migrate(createDb(pool), { migrationsFolder });
  console.log('migrations applied');
} finally {
  await pool.end();
}
