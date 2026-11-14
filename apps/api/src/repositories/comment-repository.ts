import type { Comment, CommentCursor, NewComment } from '../schemas/comment.js';

export interface CommentPageRequest {
  limit: number;
  cursor: CommentCursor | null;
}

export interface CommentPageResult {
  items: Comment[];
  nextCursor: CommentCursor | null;
}

export interface CommentRepository {
  listByBear: (
    bearId: string,
    page: CommentPageRequest
  ) => Promise<CommentPageResult>;
  listByBears: (bearIds: string[]) => Promise<Map<string, Comment[]>>;
  create: (bearId: string, input: NewComment) => Promise<Comment>;
  delete: (id: string) => Promise<boolean>;
}
