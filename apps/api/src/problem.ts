import { STATUS_CODES } from 'node:http';
import type { FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from '@fastify/type-provider-zod';
import { AppError, PROBLEM_BASE } from './errors.js';
import type { Problem } from './schemas/problem.js';

const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

export const PROBLEM_CONTENT_TYPE = 'application/problem+json; charset=utf-8';

// The request id is a UUID (see genReqId in app.ts), so it fits a urn:uuid.
function instanceOf(request: FastifyRequest): string {
  return `urn:uuid:${request.id}`;
}

// A problem without a type of its own: per RFC 9457 the type is
// "about:blank" and the title is the HTTP status phrase.
export function problem(
  status: number,
  detail: string,
  request: FastifyRequest
): Problem {
  return {
    type: 'about:blank',
    title: STATUS_CODES[status] ?? 'Error',
    status,
    detail,
    instance: instanceOf(request),
  };
}

// Fastify's own client errors (malformed JSON, unsupported Content-Type, ...)
// carry a 4xx statusCode and a message that is safe to show.
function clientErrorStatus(err: unknown): number | null {
  if (
    err instanceof Error &&
    'statusCode' in err &&
    typeof err.statusCode === 'number' &&
    err.statusCode >= BAD_REQUEST &&
    err.statusCode < INTERNAL_SERVER_ERROR
  ) {
    return err.statusCode;
  }
  return null;
}

// Maps any thrown value to a problem. 4xx details tell the client what to
// change; 5xx details are generic, the real cause only goes to the log.
export function toProblem(err: unknown, request: FastifyRequest): Problem {
  if (hasZodFastifySchemaValidationErrors(err)) {
    const errors = err.validation.map((issue) => ({
      path: issue.instancePath.replace(/^\//v, '').replaceAll('/', '.'),
      message: issue.message ?? 'is invalid',
    }));
    return {
      type: `${PROBLEM_BASE}/validation`,
      title: 'Invalid request',
      status: BAD_REQUEST,
      detail: errors.map((e) => `${e.path} ${e.message}`).join('; '),
      instance: instanceOf(request),
      errors,
    };
  }

  if (err instanceof AppError) {
    return {
      type: err.type,
      title: err.title,
      status: err.status,
      detail:
        err.status < INTERNAL_SERVER_ERROR
          ? err.message
          : (err.publicDetail ?? err.title),
      instance: instanceOf(request),
    };
  }

  const status = clientErrorStatus(err);
  if (status !== null && err instanceof Error) {
    return problem(status, err.message, request);
  }

  return {
    type: `${PROBLEM_BASE}/internal`,
    title: 'Internal server error',
    status: INTERNAL_SERVER_ERROR,
    detail: 'Something went wrong on our side. Please try again later.',
    instance: instanceOf(request),
  };
}
