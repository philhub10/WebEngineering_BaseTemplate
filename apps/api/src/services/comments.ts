import { NotFoundError } from '../errors.js';
import type { Repos } from '../repositories/index.js';
import type { Comment, NewComment } from '../schemas/comment.js';
import { loadBear } from './bears.js';

export async function listComments(
  repos: Repos,
  bearId: string
): Promise<Comment[]> {
  await loadBear(repos.bears, bearId);
  return await repos.comments.listByBear(bearId);
}

export async function createComment(
  repos: Repos,
  bearId: string,
  input: NewComment
): Promise<Comment> {
  await loadBear(repos.bears, bearId);
  return await repos.comments.create(bearId, input);
}

export async function deleteComment(repos: Repos, id: string): Promise<void> {
  if (!(await repos.comments.delete(id))) {
    throw new NotFoundError(`No comment with id "${id}"`);
  }
}
