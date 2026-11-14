import type { Comment, NewComment } from '../schemas/comment.js';

export interface CommentRepository {
  listByBear: (bearId: string) => Promise<Comment[]>;
  // Comments of several bears in one query, grouped by bear id (avoids N+1).
  listByBears: (bearIds: string[]) => Promise<Map<string, Comment[]>>;
  create: (bearId: string, input: NewComment) => Promise<Comment>;
  delete: (id: string) => Promise<boolean>;
}
