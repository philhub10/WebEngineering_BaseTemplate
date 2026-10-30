import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';

const PREFLIGHT_MAX_AGE_SECONDS = 600;

const corsConfig: FastifyPluginAsync = async (app) => {
  await app.register(cors, {
    origin: app.config.CORS_ORIGINS,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['content-type', 'x-request-id'],
    exposedHeaders: ['location', 'x-request-id'],
    credentials: false,
    maxAge: PREFLIGHT_MAX_AGE_SECONDS,
  });
};

export const corsPlugin = fp(corsConfig, {
  name: 'cors',
  fastify: '5.x',
  dependencies: ['config'],
});
