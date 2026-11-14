import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import Fastify from 'fastify';
import type { FastifyInstance, FastifyServerOptions } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod';
import { z } from 'zod';
import { configPlugin } from './plugins/config.js';
import { corsPlugin } from './plugins/cors.js';
import { dbPlugin } from './plugins/db.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { PROBLEM_CONTENT_TYPE, problem, toProblem } from './problem.js';
import { bearRoutes } from './routes/bears.js';
import { commentRoutes } from './routes/comments.js';
import { debugRoutes } from './routes/debug.js';
import { healthRoutes } from './routes/health.js';

const REQUEST_ID_HEADER = 'x-request-id';
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// Reuses an incoming x-request-id if it is a UUID, otherwise creates one.
function genReqId(request: IncomingMessage): string {
  const result = z.uuid().safeParse(request.headers[REQUEST_ID_HEADER]);
  return result.success ? result.data : randomUUID();
}

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify({ ...options, requestIdHeader: false, genReqId });

  // Route schemas are written with zod instead of JSON Schema.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Every response, including errors, carries the request id.
  app.addHook('onSend', async (request, reply) => {
    void reply.header(REQUEST_ID_HEADER, request.id);
  });

  // One error format for everything: RFC 9457 Problem Details.
  app.setErrorHandler(async (err, request, reply) => {
    const body = toProblem(err, request);
    if (body.status >= INTERNAL_SERVER_ERROR) {
      request.log.error({ err }, 'request failed');
    } else {
      request.log.info({ err }, 'request rejected');
    }
    return await reply.code(body.status).type(PROBLEM_CONTENT_TYPE).send(body);
  });

  app.setNotFoundHandler(async (request, reply) => {
    const body = problem(
      NOT_FOUND,
      `No route for ${request.method} ${request.url}`,
      request
    );
    return await reply.code(NOT_FOUND).type(PROBLEM_CONTENT_TYPE).send(body);
  });

  void app.register(configPlugin);
  void app.register(dbPlugin);
  void app.register(corsPlugin);
  void app.register(swaggerPlugin);
  void app.register(healthRoutes);
  void app.register(bearRoutes);
  void app.register(commentRoutes);
  void app.register(debugRoutes);
  return app;
}
