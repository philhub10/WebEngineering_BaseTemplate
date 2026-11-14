import { BadRequestError } from './errors.js';
import { CommentCursor } from './schemas/comment.js';

// base64url(JSON): opaque for clients, they only pass it back.
export function encodeCursor(cursor: CommentCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeCursor(value: string): CommentCursor {
  try {
    const json: unknown = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8')
    );
    return CommentCursor.parse(json);
  } catch (err) {
    throw new BadRequestError('cursor is invalid', { cause: err });
  }
}
