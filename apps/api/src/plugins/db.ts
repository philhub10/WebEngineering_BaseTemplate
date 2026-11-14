import fp from 'fastify-plugin';
import type { Pool } from 'pg';
import type { FastifyPluginAsync } from 'fastify';
import { createDb, createPool } from '../db/client.js';
import type { Db } from '../db/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    pool: Pool;
    db: Db;
  }
}

// eslint-disable-next-line @typescript-eslint/require-await -- async so Fastify awaits the plugin and runs onClose
const db: FastifyPluginAsync = async (app) => {
  const pool = createPool(app.config);

  pool.on('error', (err) => {
    app.log.warn({ err }, 'idle database client failed');
  });

  app.decorate('pool', pool);
  app.decorate('db', createDb(pool));
  app.addHook('onClose', async () => {
    await pool.end();
  });
};

export const dbPlugin = fp(db, {
  name: 'db',
  fastify: '5.x',
  dependencies: ['config'],
});
