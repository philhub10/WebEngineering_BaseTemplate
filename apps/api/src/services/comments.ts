import { decodeCursor, encodeCursor } from '../cursor.js';
import { NotFoundError } from '../errors.js';
import type { CommentReports } from '../repositories/comment-repository.js';
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

const HIDE_AT_REPORTS = 3;
const ONE_REPORT = 1;

// The next report state: one more report, hidden from the third report on.
function nextReports(comment: Comment): CommentReports {
  const reportCount = comment.reportCount + ONE_REPORT;
  const hiddenAt =
    comment.hiddenAt ??
    (reportCount >= HIDE_AT_REPORTS ? new Date().toISOString() : null);
  return { reportCount, hiddenAt };
}

// NAIVE: read, +1 in TypeScript, write. Two
// separate statements without a transaction or lock, so concurrent reports
// read the same old count and overwrite each other (lost update).
export async function reportCommentNaive(
  repos: Repos,
  id: string
): Promise<Comment> {
  const comment = await repos.comments.findById(id);
  if (comment === null) {
    throw new NotFoundError(`No comment with id "${id}"`);
  }
  const updated = await repos.comments.updateReports(id, nextReports(comment));
  if (updated === null) {
    throw new NotFoundError(`No comment with id "${id}"`);
  }
  return updated;
}

// FIXED: the same steps inside one transaction. SELECT ... FOR UPDATE locks
// the row, so a concurrent report waits until this one has committed
export async function reportComment(
  repos: Repos,
  id: string
): Promise<Comment> {
  return await repos.transaction(async (tx) => {
    const comment = await tx.comments.findById(id, { lock: true });
    if (comment === null) {
      throw new NotFoundError(`No comment with id "${id}"`);
    }
    const updated = await tx.comments.updateReports(id, nextReports(comment));
    if (updated === null) {
      throw new NotFoundError(`No comment with id "${id}"`);
    }
    return updated;
  });
}
