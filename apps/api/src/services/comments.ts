import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../errors.js';
import type { Comment, NewComment } from '../schemas/comment.js';

const comments = new Map<string, Comment>();

export function listComments(bearId: string): Comment[] {
  return [...comments.values()].filter((comment) => comment.bearId === bearId);
}

export function createComment(bearId: string, newComment: NewComment): Comment {
  const comment: Comment = {
    id: randomUUID(),
    bearId,
    author: newComment.author,
    text: newComment.text,
    createdAt: new Date().toISOString(),
  };
  comments.set(comment.id, comment);
  return comment;
}

export function deleteComment(id: string): void {
  if (!comments.delete(id)) {
    throw new NotFoundError(`No comment with id "${id}"`);
  }
}
