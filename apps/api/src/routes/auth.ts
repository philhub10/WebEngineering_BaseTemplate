import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { authenticatedUser, requireAuth } from '../plugins/auth.js';
import { loginRateLimit, registerRateLimit } from '../plugins/rate-limit.js';
import { SESSION_COOKIE } from '../plugins/session.js';
import { LoginBody, PublicUser, RegisterBody } from '../schemas/auth.js';
import { NoBody } from '../schemas/no-body.js';
import { problemResponses } from '../schemas/problem.js';
import { authenticate, registerUser } from '../services/auth.js';

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;

export const authRoutes: FastifyPluginCallback = (app, _options, done) => {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.post(
    '/api/auth/register',
    {
      config: { rateLimit: registerRateLimit },
      schema: {
        body: RegisterBody,
        response: { [CREATED]: PublicUser, ...problemResponses },
      },
    },
    async (request, reply) => {
      const user = await registerUser(app.repos, request.body);
      return await reply.code(CREATED).send(user);
    }
  );

  api.post(
    '/api/auth/login',
    {
      config: { rateLimit: loginRateLimit },
      schema: {
        body: LoginBody,
        response: { [OK]: PublicUser, ...problemResponses },
      },
    },
    async (request) => {
      const user = await authenticate(app.repos, request.body);
      // New session id after login: protects against session fixation.
      await request.session.regenerate();
      request.session.set('userId', user.id);
      return user;
    }
  );

  api.post(
    '/api/auth/logout',
    {
      schema: {
        body: NoBody,
        response: {
          [NO_CONTENT]: z.null().describe('Logged out'),
          ...problemResponses,
        },
      },
    },
    async (request, reply) => {
      // Deletes the session row: a copied cookie is useless afterwards.
      await request.session.destroy();
      return await reply
        .clearCookie(SESSION_COOKIE, { path: '/' })
        .code(NO_CONTENT)
        .send(null);
    }
  );

  api.get(
    '/api/auth/me',
    {
      preHandler: requireAuth,
      schema: { response: { [OK]: PublicUser, ...problemResponses } },
    },
    async (request) => await Promise.resolve(authenticatedUser(request))
  );

  done();
};
