import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { comments } from '../../db/schema.js';
import type { Comment, NewComment } from '../../schemas/comment.js';
import type {
  CommentPageRequest,
  CommentPageResult,
  CommentRepository,
} from '../comment-repository.js';

type CommentRow = typeof comments.$inferSelect;

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    bearId: row.bearId,
    author: row.author,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

const oldestFirst = [asc(comments.createdAt), asc(comments.id)];
const newestFirst = [desc(comments.createdAt), desc(comments.id)];
const LOOKAHEAD = 1;
const FIRST = 0;
const LAST = -1;

export class DrizzleCommentRepository implements CommentRepository {
  constructor(private readonly db: Db) {}

  async listByBear(
    bearId: string,
    { limit, cursor }: CommentPageRequest
  ): Promise<CommentPageResult> {
    // Row-value comparison: matches the index (bear_id, created_at, id), so
    // PostgreSQL seeks to the cursor instead of skipping rows like OFFSET.
    const afterCursor =
      cursor === null
        ? undefined
        : sql`(${comments.createdAt}, ${comments.id}) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)`;
    const rows = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.bearId, bearId), afterCursor))
      .orderBy(...newestFirst)
      .limit(limit + LOOKAHEAD);

    const items = rows.slice(FIRST, limit).map(toComment);
    const last = items.at(LAST);
    const hasMore = rows.length > limit;
    return {
      items,
      nextCursor:
        hasMore && last !== undefined
          ? { createdAt: last.createdAt, id: last.id }
          : null,
    };
  }

  async listByBears(bearIds: string[]): Promise<Map<string, Comment[]>> {
    const [firstId] = bearIds;
    if (firstId === undefined) {
      return new Map();
    }
    const rows = await this.db
      .select()
      .from(comments)
      .where(inArray(comments.bearId, bearIds))
      .orderBy(...oldestFirst);
    return Map.groupBy(rows.map(toComment), (comment) => comment.bearId);
  }

  async create(bearId: string, input: NewComment): Promise<Comment> {
    const [row] = await this.db
      .insert(comments)
      .values({ bearId, author: input.author, text: input.text })
      .returning();
    if (row === undefined) {
      throw new Error('INSERT ... RETURNING returned no row');
    }
    return toComment(row);
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    return deleted !== undefined;
  }
}
