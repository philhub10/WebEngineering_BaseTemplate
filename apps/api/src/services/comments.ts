import { decodeCursor, encodeCursor } from '../cursor.js';
import { NotFoundError } from '../errors.js';
import type { Repos } from '../repositories/index.js';
import type {
  Comment,
  CommentPage,
  CommentsQuery,
  NewComment,
} from '../schemas/comment.js';
import { loadBear } from './bears.js';

export async function listComments(
  repos: Repos,
  bearId: string,
  query: CommentsQuery
): Promise<CommentPage> {
  const cursor = query.cursor === undefined ? null : decodeCursor(query.cursor);
  await loadBear(repos.bears, bearId);
  const page = await repos.comments.listByBear(bearId, {
    limit: query.limit,
    cursor,
  });
  return {
    items: page.items,
    nextCursor: page.nextCursor === null ? null : encodeCursor(page.nextCursor),
  };
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
