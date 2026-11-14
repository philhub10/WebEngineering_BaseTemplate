import { randomUUID } from 'node:crypto';
import type { Comment, NewComment } from '../../schemas/comment.js';
import type { CommentRepository } from '../comment-repository.js';

export class MemoryCommentRepository implements CommentRepository {
  private readonly comments = new Map<string, Comment>();

  async listByBear(bearId: string): Promise<Comment[]> {
    return await Promise.resolve(
      [...this.comments.values()].filter((comment) => comment.bearId === bearId)
    );
  }

  async listByBears(bearIds: string[]): Promise<Map<string, Comment[]>> {
    const wanted = new Set(bearIds);
    const matching = [...this.comments.values()].filter((comment) =>
      wanted.has(comment.bearId)
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
    };
    this.comments.set(comment.id, comment);
    return await Promise.resolve(comment);
  }

  async delete(id: string): Promise<boolean> {
    return await Promise.resolve(this.comments.delete(id));
  }
}
