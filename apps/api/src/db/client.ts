import { drizzle } from 'drizzle-orm/node-postgres';
import type {
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import type { Env } from '../schemas/env.js';
import * as schema from './schema.js';

export type Db = NodePgDatabase<typeof schema>;
// The pool (db) or an open transaction (tx): repositories run on either.
export type Executor = PgDatabase<NodePgQueryResultHKT, typeof schema>;

const IDLE_TIMEOUT_MS = 10_000;

// Used by the API (plugins/db.ts) and by the migrate and seed scripts.
export function createPool(config: Env): Pool {
  return new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DB_POOL_MAX,
    idleTimeoutMillis: IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT_MS,
  });
}

export function createDb(pool: Pool): Db {
  return drizzle({ client: pool, schema });
}
