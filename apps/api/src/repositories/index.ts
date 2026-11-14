import type { BearRepository } from './bear-repository.js';
import type { CommentRepository } from './comment-repository.js';

export interface Repos {
  bears: BearRepository;
  comments: CommentRepository;
}
