import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { Executor } from '../../db/client.js';
import type { Actor } from '../../auth/policy.js';
import { comments } from '../../db/schema.js';
import type { Comment, NewComment } from '../../schemas/comment.js';
import type {
  CommentPageRequest,
  CommentPageResult,
  CommentReports,
  CommentRepository,
} from '../comment-repository.js';

type CommentRow = typeof comments.$inferSelect;

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    bearId: row.bearId,
    authorId: row.authorId,
    author: row.author,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
    reportCount: row.reportCount,
    hiddenAt: row.hiddenAt?.toISOString() ?? null,
  };
}

const oldestFirst = [asc(comments.createdAt), asc(comments.id)];
const newestFirst = [desc(comments.createdAt), desc(comments.id)];
const LOOKAHEAD = 1;
const FIRST = 0;
const LAST = -1;

export class DrizzleCommentRepository implements CommentRepository {
  constructor(private readonly db: Executor) {}

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
      .where(
        and(eq(comments.bearId, bearId), isNull(comments.hiddenAt), afterCursor)
      )
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
      .where(and(inArray(comments.bearId, bearIds), isNull(comments.hiddenAt)))
      .orderBy(...oldestFirst);
    return Map.groupBy(rows.map(toComment), (comment) => comment.bearId);
  }

  async create(
    bearId: string,
    input: NewComment,
    authorId: string
  ): Promise<Comment> {
    const [row] = await this.db
      .insert(comments)
      .values({ bearId, authorId, author: input.author, text: input.text })
      .returning();
    if (row === undefined) {
      throw new Error('INSERT ... RETURNING returned no row');
    }
    return toComment(row);
  }

  async delete(id: string, actor: Actor): Promise<boolean> {
    const [deleted] = await this.db
      .delete(comments)
      .where(
        and(
          eq(comments.id, id),
          actor.role === 'moderator'
            ? undefined
            : eq(comments.authorId, actor.id)
        )
      )
      .returning({ id: comments.id });
    return deleted !== undefined;
  }

  async findById(
    id: string,
    options = { lock: false }
  ): Promise<Comment | null> {
    const query = this.db.select().from(comments).where(eq(comments.id, id));
    const [row] = options.lock ? await query.for('update') : await query;
    return row === undefined ? null : toComment(row);
  }

  async updateReports(
    id: string,
    { reportCount, hiddenAt }: CommentReports
  ): Promise<Comment | null> {
    const [row] = await this.db
      .update(comments)
      .set({
        reportCount,
        hiddenAt: hiddenAt === null ? null : new Date(hiddenAt),
      })
      .where(eq(comments.id, id))
      .returning();
    return row === undefined ? null : toComment(row);
  }
}
