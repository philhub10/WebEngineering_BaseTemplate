import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import type { FastifyPluginAsync } from 'fastify';

// helmet's defaults. /api/docs replaces it with its own (swagger.ts).
const securityHeaders: FastifyPluginAsync = async (app) => {
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });
};

export const securityHeadersPlugin = fp(securityHeaders, {
  name: 'security-headers',
  fastify: '5.x',
});
