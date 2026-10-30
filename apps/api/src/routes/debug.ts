import type { FastifyPluginCallback } from 'fastify';

// Routes to provoke errors by hand, only registered when ENABLE_DEBUG_ROUTES=true.
export const debugRoutes: FastifyPluginCallback = (app, _options, done) => {
  if (app.config.ENABLE_DEBUG_ROUTES) {
    // hide: not part of the public API contract in /api/docs.
    app.get('/api/debug/error', { schema: { hide: true } }, () => {
      throw new Error('Simulated failure: db password=hunter2 at db.internal');
    });
  }
  done();
};
