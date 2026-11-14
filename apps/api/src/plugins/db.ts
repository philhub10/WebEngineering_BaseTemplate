import fp from 'fastify-plugin';
import { Pool } from 'pg';
import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    pool: Pool;
  }
}

const IDLE_TIMEOUT_MS = 10_000;

// eslint-disable-next-line @typescript-eslint/require-await -- async so Fastify awaits the plugin and runs onClose
const db: FastifyPluginAsync = async (app) => {
  const pool = new Pool({
    connectionString: app.config.DATABASE_URL,
    max: app.config.DB_POOL_MAX,
    idleTimeoutMillis: IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: app.config.DB_CONNECTION_TIMEOUT_MS,
  });

  pool.on('error', (err) => {
    app.log.warn({ err }, 'idle database client failed');
  });

  app.decorate('pool', pool);
  app.addHook('onClose', async () => {
    await pool.end();
  });
};

export const dbPlugin = fp(db, {
  name: 'db',
  fastify: '5.x',
  dependencies: ['config'],
});
