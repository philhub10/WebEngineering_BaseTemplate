import type { Actor } from '../auth/policy.js';
import type { Comment, CommentCursor, NewComment } from '../schemas/comment.js';

export interface CommentPageRequest {
  limit: number;
  cursor: CommentCursor | null;
}

export interface CommentPageResult {
  items: Comment[];
  nextCursor: CommentCursor | null;
}

export interface CommentReports {
  reportCount: number;
  hiddenAt: string | null;
}

export interface CommentRepository {
  listByBear: (
    bearId: string,
    page: CommentPageRequest
  ) => Promise<CommentPageResult>;
  listByBears: (bearIds: string[]) => Promise<Map<string, Comment[]>>;
  create: (
    bearId: string,
    input: NewComment,
    authorId: string
  ) => Promise<Comment>;
  delete: (id: string, actor: Actor) => Promise<boolean>;
  findById: (
    id: string,
    options?: { lock: boolean }
  ) => Promise<Comment | null>;
  updateReports: (
    id: string,
    reports: CommentReports
  ) => Promise<Comment | null>;
}
