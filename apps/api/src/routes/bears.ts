import type { FastifyPluginCallback } from 'fastify';
import type { Bear } from '../schemas/bear.js';
import { loadBears } from '../services/bears.js';

const NOT_FOUND = 404;

export const bearRoutes: FastifyPluginCallback = (app, _options, done) => {
  app.get('/api/bears', async (): Promise<Bear[]> => {
    return await loadBears(app.config);
  });

  app.get<{ Params: { id: string } }>(
    '/api/bears/:id',
    async (request, reply): Promise<Bear | undefined> => {
      const bears = await loadBears(app.config);
      const bear = bears.find(
        (candidate) => candidate.id === request.params.id
      );

      if (bear === undefined) {
        return await reply
          .code(NOT_FOUND)
          .send({ message: `No bear with id "${request.params.id}"` });
      }
      return bear;
    }
  );

  done();
};
