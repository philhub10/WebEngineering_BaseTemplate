import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { reportCommentNaive } from '../services/comments.js';

// Routes to provoke errors by hand, only registered when ENABLE_DEBUG_ROUTES=true.
export const debugRoutes: FastifyPluginCallback = (app, _options, done) => {
  if (app.config.ENABLE_DEBUG_ROUTES) {
    const api = app.withTypeProvider<ZodTypeProvider>();

    // hide: not part of the public API contract in /api/docs.
    api.get('/api/debug/error', { schema: { hide: true } }, () => {
      throw new Error('Simulated failure: db password=hunter2 at db.internal');
    });

    // The naive report (lost update), to reproduce the race with
    // npm run report:storm -- --naive
    api.post(
      '/api/debug/comments/:commentId/report-naive',
      {
        schema: {
          hide: true,
          params: z.object({ commentId: z.uuid('must be a UUID') }),
        },
      },
      async (request) => {
        return await reportCommentNaive(app.repos, request.params.commentId);
      }
    );
  }
  done();
};
