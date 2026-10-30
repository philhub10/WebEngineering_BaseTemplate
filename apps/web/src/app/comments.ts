import { toApiError } from './problem';

export interface Comment {
  id: string;
  bearId: string;
  author: string;
  text: string;
  createdAt: string;
}

// What the comment form sends to the API.
export interface NewComment {
  author: string;
  text: string;
}

export async function loadComments(
  bearId: string,
  signal?: AbortSignal
): Promise<Comment[]> {
  const res = await fetch(`/api/bears/${encodeURIComponent(bearId)}/comments`, {
    signal,
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as Comment[];
}

export async function createComment(
  bearId: string,
  newComment: NewComment
): Promise<Comment> {
  const res = await fetch(`/api/bears/${encodeURIComponent(bearId)}/comments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(newComment),
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as Comment;
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
}
