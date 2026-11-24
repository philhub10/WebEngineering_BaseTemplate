import { apiUrl, withCookie } from './api';
import { toApiError } from './problem';

export interface Comment {
  id: string;
  bearId: string;
  authorId: string | null;
  author: string;
  text: string;
  createdAt: string;
  reportCount: number;
  hiddenAt: string | null;
}

export interface CommentPage {
  items: Comment[];
  nextCursor: string | null;
}

// What the comment form sends to the API.
export interface NewComment {
  author: string;
  text: string;
}

export async function loadComments(
  bearId: string,
  cursor: string | null,
  signal?: AbortSignal
): Promise<CommentPage> {
  const query = cursor === null ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(
    apiUrl(`/api/bears/${encodeURIComponent(bearId)}/comments${query}`),
    { signal }
  );
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as CommentPage;
}

export async function createComment(
  bearId: string,
  newComment: NewComment
): Promise<Comment> {
  const res = await fetch(
    apiUrl(`/api/bears/${encodeURIComponent(bearId)}/comments`),
    {
      ...withCookie,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newComment),
    }
  );
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as Comment;
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/comments/${encodeURIComponent(id)}`), {
    ...withCookie,
    method: 'DELETE',
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
}

export async function reportComment(id: string): Promise<Comment> {
  const res = await fetch(
    apiUrl(`/api/comments/${encodeURIComponent(id)}/report`),
    { ...withCookie, method: 'POST' }
  );
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as Comment;
}
