import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { PublicUser, RegisterBody } from '../schemas/auth.js';
import { problemResponses } from '../schemas/problem.js';
import { registerUser } from '../services/auth.js';

const CREATED = 201;

export const authRoutes: FastifyPluginCallback = (app, _options, done) => {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.post(
    '/api/auth/register',
    {
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

  done();
};
