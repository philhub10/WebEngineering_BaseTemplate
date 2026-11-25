import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { authorize } from '../auth/authorize.js';
import { authenticatedUser, requireAuth } from '../plugins/auth.js';
import { BearId } from '../schemas/bear.js';
import {
  Comment,
  CommentPage,
  CommentsQuery,
  NewComment,
} from '../schemas/comment.js';
import { NoBody } from '../schemas/no-body.js';
import { problemResponses } from '../schemas/problem.js';
import {
  createComment,
  deleteComment,
  listComments,
  loadCommentSubject,
  reportComment,
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
        querystring: CommentsQuery,
        response: { [OK]: CommentPage, ...problemResponses },
      },
    },
    async (request) => {
      return await listComments(app.repos, request.params.id, request.query);
    }
  );

  api.post(
    '/api/bears/:id/comments',
    {
      preHandler: [requireAuth, authorize('comment:create')],
      schema: {
        params: z.object({ id: BearId }),
        body: NewComment,
        response: { [CREATED]: Comment, ...problemResponses },
      },
    },
    async (request, reply) => {
      const comment = await createComment(
        app.repos,
        request.params.id,
        request.body,
        authenticatedUser(request)
      );
      return await reply
        .code(CREATED)
        .header('location', `/api/comments/${comment.id}`)
        .send(comment);
    }
  );

  api.delete(
    '/api/comments/:commentId',
    {
      preHandler: [
        requireAuth,
        authorize(
          'comment:delete',
          async (request) =>
            await loadCommentSubject(app.repos, request.params.commentId)
        ),
      ],
      schema: {
        params: z.object({ commentId: z.uuid('must be a UUID') }),
        body: NoBody,
        response: {
          [NO_CONTENT]: z.null().describe('Comment deleted'),
          ...problemResponses,
        },
      },
    },
    async (request, reply) => {
      await deleteComment(
        app.repos,
        request.params.commentId,
        authenticatedUser(request)
      );
      return await reply.code(NO_CONTENT).send(null);
    }
  );

  api.post(
    '/api/comments/:commentId/report',
    {
      preHandler: [requireAuth, authorize('comment:report')],
      schema: {
        params: z.object({ commentId: z.uuid('must be a UUID') }),
        body: NoBody,
        response: { [OK]: Comment, ...problemResponses },
      },
    },
    async (request) => {
      return await reportComment(app.repos, request.params.commentId);
    }
  );

  done();
};
