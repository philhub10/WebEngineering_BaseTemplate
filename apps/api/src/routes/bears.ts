import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { Bear, BearId, BearsQuery } from '../schemas/bear.js';
import { problemResponses } from '../schemas/problem.js';
import { loadBear, loadBears } from '../services/bears.js';

const OK = 200;

export const bearRoutes: FastifyPluginCallback = (app, _options, done) => {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.get(
    '/api/bears',
    {
      schema: {
        querystring: BearsQuery,
        response: { [OK]: z.array(Bear), ...problemResponses },
      },
    },
    async (request) => {
      return await loadBears(app.repos.bears, request.query.q);
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
