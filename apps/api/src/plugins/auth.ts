import fp from 'fastify-plugin';
import type {
  FastifyPluginCallback,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify';
import { UnauthorizedError } from '../errors.js';
import type { PublicUser } from '../schemas/auth.js';
import { toPublicUser } from '../services/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    // Set by requireAuth; null on routes without it.
    user: PublicUser | null;
  }
}

// One place that turns a session into a user, or answers 401.
export const requireAuth: preHandlerAsyncHookHandler = async (request) => {
  const userId = request.session.get('userId');
  const user =
    userId === undefined
      ? null
      : await request.server.repos.users.findById(userId);
  if (user === null) {
    throw new UnauthorizedError('You need to log in first.');
  }
  request.setDecorator('user', toPublicUser(user));
};

export function authenticatedUser(request: FastifyRequest): PublicUser {
  if (request.user === null) {
    throw new UnauthorizedError('You need to log in first.');
  }
  return request.user;
}

const auth: FastifyPluginCallback = (app, _options, done) => {
  app.decorateRequest('user', null);
  done();
};

export const authPlugin = fp(auth, {
  name: 'auth',
  fastify: '5.x',
  dependencies: ['session'],
});
