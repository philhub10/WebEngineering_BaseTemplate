import type { FastifyRequest } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../errors.js';
import { can } from './policy.js';
import type { Action, CommentSubject } from './policy.js';

// One preHandler factory for every route: loads the subject, asks the policy.
export function authorize<Request extends FastifyRequest>(
  action: Action,
  load?: (request: Request) => Promise<CommentSubject>
): (request: Request) => Promise<void> {
  return async (request) => {
    const subject = load === undefined ? undefined : await load(request);
    const verdict = can(request.user, action, subject);
    if (verdict === 'unauthenticated') {
      throw new UnauthorizedError('You need to log in first.');
    }
    if (verdict === 'forbidden') {
      throw new ForbiddenError('You are not allowed to do this.');
    }
  };
}
