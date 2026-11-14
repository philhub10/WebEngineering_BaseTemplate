import { asc, eq, inArray } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { comments } from '../../db/schema.js';
import type { Comment, NewComment } from '../../schemas/comment.js';
import type { CommentRepository } from '../comment-repository.js';

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

export class DrizzleCommentRepository implements CommentRepository {
  constructor(private readonly db: Db) {}

  async listByBear(bearId: string): Promise<Comment[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(eq(comments.bearId, bearId))
      .orderBy(...oldestFirst);
    return rows.map(toComment);
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
