import fp from 'fastify-plugin';
import type { FastifyPluginCallback } from 'fastify';
import type { Repos } from '../repositories/index.js';
import { createDrizzleRepos } from '../repositories/drizzle/index.js';

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
  app.decorate('repos', options.repos ?? createDrizzleRepos(app.db));
  done();
};

export const repositoriesPlugin = fp(repositories, {
  name: 'repositories',
  fastify: '5.x',
  dependencies: ['db'],
});
