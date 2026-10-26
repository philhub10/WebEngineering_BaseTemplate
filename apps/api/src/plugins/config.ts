import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { loadEnv } from '../schemas/env.js';
import type { Env } from '../schemas/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

// eslint-disable-next-line @typescript-eslint/require-await -- async so loadEnv() errors reject ready()
const config: FastifyPluginAsync = async (app) => {
  app.decorate('config', loadEnv());
};

export const configPlugin = fp(config, { name: 'config', fastify: '5.x' });
