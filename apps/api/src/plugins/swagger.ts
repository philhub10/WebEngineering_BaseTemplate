import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from '@fastify/type-provider-zod';
import type { FastifyPluginAsync } from 'fastify';

// Generates the OpenAPI document from the zod route schemas, so the code is
// the single source of truth.
const swaggerConfig: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'Bear API', version: '0.1.0' },
    },
    transform: jsonSchemaTransform,
    // Turns schemas with a `.meta({ id })` (e.g. Problem) into components.
    transformObject: jsonSchemaTransformObject,
  });
  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    // Its own CSP for the docs pages: helmet's 'none' would block the UI,
    // this one allows the UI's scripts and styles from our own origin.
    staticCSP: true,
  });
};

export const swaggerPlugin = fp(swaggerConfig, {
  name: 'swagger',
  fastify: '5.x',
});
