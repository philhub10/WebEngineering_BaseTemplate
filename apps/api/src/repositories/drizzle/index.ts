import type { Executor } from '../../db/client.js';
import type { Repos } from '../index.js';
import { DrizzleBearRepository } from './bear-repository.js';
import { DrizzleCommentRepository } from './comment-repository.js';
import { DrizzleUserRepository } from './user-repository.js';

export function createDrizzleRepos(db: Executor): Repos {
  return {
    bears: new DrizzleBearRepository(db),
    comments: new DrizzleCommentRepository(db),
    users: new DrizzleUserRepository(db),
    transaction: async (work) =>
      await db.transaction(async (tx) => await work(createDrizzleRepos(tx))),
  };
}
