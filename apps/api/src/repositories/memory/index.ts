import type { Bear } from '../../schemas/bear.js';
import type { Repos } from '../index.js';
import { MemoryBearRepository } from './bear-repository.js';
import { MemoryCommentRepository } from './comment-repository.js';
import { MemoryUserRepository } from './user-repository.js';

export function createMemoryRepos(bears: Bear[] = []): Repos {
  let queue: Promise<unknown> = Promise.resolve();
  const repos: Repos = {
    bears: new MemoryBearRepository(bears),
    comments: new MemoryCommentRepository(),
    users: new MemoryUserRepository(),
    transaction: async <T>(work: (tx: Repos) => Promise<T>): Promise<T> => {
      const run = queue.then(async () => await work(repos));
      queue = run.catch(() => undefined);
      return await run;
    },
  };
  return repos;
}
