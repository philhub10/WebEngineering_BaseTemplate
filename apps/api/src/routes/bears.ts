import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { Bear, BearId } from '../schemas/bear.js';
import { problemResponses } from '../schemas/problem.js';
import { loadBear, loadBears } from '../services/bears.js';

const OK = 200;

export const bearRoutes: FastifyPluginCallback = (app, _options, done) => {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.get(
    '/api/bears',
    {
      schema: {
        response: { [OK]: z.array(Bear), ...problemResponses },
      },
    },
    async () => {
      return await loadBears(app.repos.bears);
    }
  );

  api.get(
    '/api/bears/:id',
    {
      schema: {
        params: z.object({ id: BearId }),
        response: { [OK]: Bear, ...problemResponses },
      },
    },
    async (request) => {
      return await loadBear(app.repos.bears, request.params.id);
    }
  );

  done();
};
