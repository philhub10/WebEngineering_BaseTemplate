import type { FastifyPluginCallback } from 'fastify';
import type { Bear } from '../schemas/bear.js';
import { loadBear, loadBears } from '../services/bears.js';

export const bearRoutes: FastifyPluginCallback = (app, _options, done) => {
  app.get('/api/bears', async (): Promise<Bear[]> => {
    return await loadBears(app.config);
  });

  app.get<{ Params: { id: string } }>(
    '/api/bears/:id',
    async (request): Promise<Bear> => {
      return await loadBear(app.config, request.params.id);
    }
  );

  done();
};
