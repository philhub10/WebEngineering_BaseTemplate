import type { BearRepository } from './bear-repository.js';
import type { CommentRepository } from './comment-repository.js';
import type { SessionRepository } from './session-repository.js';
import type { UserRepository } from './user-repository.js';

export interface Repos {
  bears: BearRepository;
  comments: CommentRepository;
  users: UserRepository;
  sessions: SessionRepository;
  transaction: <T>(work: (repos: Repos) => Promise<T>) => Promise<T>;
}
