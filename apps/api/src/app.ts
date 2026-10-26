import Fastify from 'fastify';
import type { FastifyInstance, FastifyServerOptions } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod';
import { configPlugin } from './plugins/config.js';
import { bearRoutes } from './routes/bears.js';
import { commentRoutes } from './routes/comments.js';
import { healthRoutes } from './routes/health.js';

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(options);

  // Route schemas are written with zod instead of JSON Schema.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  void app.register(configPlugin);
  void app.register(healthRoutes);
  void app.register(bearRoutes);
  void app.register(commentRoutes);
  return app;
}
