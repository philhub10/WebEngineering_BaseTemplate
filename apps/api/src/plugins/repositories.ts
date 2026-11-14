import fp from 'fastify-plugin';
import type { FastifyPluginCallback } from 'fastify';
import type { Repos } from '../repositories/index.js';
import { DrizzleBearRepository } from '../repositories/drizzle/bear-repository.js';
import { DrizzleCommentRepository } from '../repositories/drizzle/comment-repository.js';

declare module 'fastify' {
  interface FastifyInstance {
    repos: Repos;
  }
}

export interface RepositoriesOptions {
  repos?: Repos | undefined;
}

const repositories: FastifyPluginCallback<RepositoriesOptions> = (
  app,
  options,
  done
) => {
  app.decorate(
    'repos',
    options.repos ?? {
      bears: new DrizzleBearRepository(app.db),
      comments: new DrizzleCommentRepository(app.db),
    }
  );
  done();
};

export const repositoriesPlugin = fp(repositories, {
  name: 'repositories',
  fastify: '5.x',
  dependencies: ['db'],
});
