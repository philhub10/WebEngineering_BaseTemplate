import { randomUUID } from 'node:crypto';
import type {
  Comment,
  CommentCursor,
  NewComment,
} from '../../schemas/comment.js';
import type {
  CommentPageRequest,
  CommentPageResult,
  CommentReports,
  CommentRepository,
} from '../comment-repository.js';

const FIRST = 0;
const LAST = -1;

const EQUAL = 0;
const NO_REPORTS = 0;

// Same order as ORDER BY created_at DESC, id DESC.
function newestFirst(a: Comment, b: Comment): number {
  const byTime = b.createdAt.localeCompare(a.createdAt);
  return byTime === EQUAL ? b.id.localeCompare(a.id) : byTime;
}

function isBefore(comment: Comment, cursor: CommentCursor): boolean {
  return (
    comment.createdAt < cursor.createdAt ||
    (comment.createdAt === cursor.createdAt && comment.id < cursor.id)
  );
}

export class MemoryCommentRepository implements CommentRepository {
  private readonly comments = new Map<string, Comment>();

  async listByBear(
    bearId: string,
    { limit, cursor }: CommentPageRequest
  ): Promise<CommentPageResult> {
    const matching = [...this.comments.values()]
      .filter((comment) => comment.bearId === bearId)
      .filter((comment) => comment.hiddenAt === null)
      .filter((comment) => cursor === null || isBefore(comment, cursor))
      .sort(newestFirst);

    const items = matching.slice(FIRST, limit);
    const last = items.at(LAST);
    const hasMore = matching.length > limit;
    return await Promise.resolve({
      items,
      nextCursor:
        hasMore && last !== undefined
          ? { createdAt: last.createdAt, id: last.id }
          : null,
    });
  }

  async listByBears(bearIds: string[]): Promise<Map<string, Comment[]>> {
    const wanted = new Set(bearIds);
    const matching = [...this.comments.values()].filter(
      (comment) => wanted.has(comment.bearId) && comment.hiddenAt === null
    );
    return await Promise.resolve(
      Map.groupBy(matching, (comment) => comment.bearId)
    );
  }

  async create(bearId: string, input: NewComment): Promise<Comment> {
    const comment: Comment = {
      id: randomUUID(),
      bearId,
      author: input.author,
      text: input.text,
      createdAt: new Date().toISOString(),
      reportCount: NO_REPORTS,
      hiddenAt: null,
    };
    this.comments.set(comment.id, comment);
    return await Promise.resolve(comment);
  }

  async delete(id: string): Promise<boolean> {
    return await Promise.resolve(this.comments.delete(id));
  }

  async findById(id: string): Promise<Comment | null> {
    return await Promise.resolve(this.comments.get(id) ?? null);
  }

  async updateReports(
    id: string,
    reports: CommentReports
  ): Promise<Comment | null> {
    const comment = this.comments.get(id);
    if (comment === undefined) {
      return null;
    }
    const updated = { ...comment, ...reports };
    this.comments.set(id, updated);
    return await Promise.resolve(updated);
  }
}
