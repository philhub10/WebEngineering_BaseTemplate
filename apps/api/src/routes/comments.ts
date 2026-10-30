import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { BearId } from '../schemas/bear.js';
import { Comment, NewComment } from '../schemas/comment.js';
import { loadBear } from '../services/bears.js';
import {
  createComment,
  deleteComment,
  listComments,
} from '../services/comments.js';

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;

export const commentRoutes: FastifyPluginCallback = (app, _options, done) => {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.get(
    '/api/bears/:id/comments',
    {
      schema: {
        params: z.object({ id: BearId }),
        response: { [OK]: z.array(Comment) },
      },
    },
    async (request) => {
      await loadBear(app.config, request.params.id);
      return listComments(request.params.id);
    }
  );

  api.post(
    '/api/bears/:id/comments',
    {
      schema: {
        params: z.object({ id: BearId }),
        body: NewComment,
        response: { [CREATED]: Comment },
      },
    },
    async (request, reply) => {
      await loadBear(app.config, request.params.id);
      const comment = createComment(request.params.id, request.body);
      return await reply
        .code(CREATED)
        .header('location', `/api/comments/${comment.id}`)
        .send(comment);
    }
  );

  api.delete(
    '/api/comments/:commentId',
    {
      schema: {
        params: z.object({ commentId: z.uuid('must be a UUID') }),
      },
    },
    async (request, reply) => {
      deleteComment(request.params.commentId);
      return await reply.code(NO_CONTENT).send();
    }
  );

  done();
};
