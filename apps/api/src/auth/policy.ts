import type { Role } from '../schemas/auth.js';

export interface Actor {
  id: string;
  role: Role;
}

export type Action = 'comment:create' | 'comment:delete' | 'comment:report';

export type Verdict = 'allow' | 'unauthenticated' | 'forbidden';

export interface CommentSubject {
  authorId: string | null;
}

export function can(
  actor: Actor | null,
  action: Action,
  subject?: CommentSubject
): Verdict {
  if (actor === null) {
    return 'unauthenticated';
  }
  switch (action) {
    case 'comment:create':
    case 'comment:report':
      return 'allow';
    case 'comment:delete':
      if (actor.role === 'moderator') {
        return 'allow'; // RBAC
      }
      // Ownership; a missing subject or author is forbidden, never allowed.
      return subject?.authorId === actor.id ? 'allow' : 'forbidden';
  }
}
