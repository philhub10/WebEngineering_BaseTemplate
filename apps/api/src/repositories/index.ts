import type { BearRepository } from './bear-repository.js';
import type { CommentRepository } from './comment-repository.js';
import type { UserRepository } from './user-repository.js';

export interface Repos {
  bears: BearRepository;
  comments: CommentRepository;
  users: UserRepository;
  transaction: <T>(work: (repos: Repos) => Promise<T>) => Promise<T>;
}
