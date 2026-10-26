import Fastify from 'fastify';
import type { FastifyInstance, FastifyServerOptions } from 'fastify';
import { configPlugin } from './plugins/config.js';
import { bearRoutes } from './routes/bears.js';
import { healthRoutes } from './routes/health.js';

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(options);
  void app.register(configPlugin);
  void app.register(healthRoutes);
  void app.register(bearRoutes);
  return app;
}
