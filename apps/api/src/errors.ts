export const PROBLEM_BASE = 'https://bears.example/problems';

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly type: string;
  abstract readonly title: string;
  readonly publicDetail: string | null = null;
}

export class BadRequestError extends AppError {
  override name = 'BadRequestError';
  readonly status = 400;
  readonly type = `${PROBLEM_BASE}/bad-request`;
  readonly title = 'Bad request';
}

export class UnauthorizedError extends AppError {
  override name = 'UnauthorizedError';
  readonly status = 401;
  readonly type = `${PROBLEM_BASE}/unauthenticated`;
  readonly title = 'Authentication required';
}

export class ForbiddenError extends AppError {
  override name = 'ForbiddenError';
  readonly status = 403;
  readonly type = `${PROBLEM_BASE}/forbidden`;
  readonly title = 'Forbidden';
}

export class NotFoundError extends AppError {
  override name = 'NotFoundError';
  readonly status = 404;
  readonly type = `${PROBLEM_BASE}/not-found`;
  readonly title = 'Resource not found';
}

export class ConflictError extends AppError {
  override name = 'ConflictError';
  readonly status = 409;
  readonly type = `${PROBLEM_BASE}/conflict`;
  readonly title = 'Conflict';
}

export class UpstreamError extends AppError {
  override name = 'UpstreamError';
  readonly status = 502;
  readonly type = `${PROBLEM_BASE}/upstream`;
  readonly title = 'Upstream unavailable';
  override readonly publicDetail =
    'The bear data source is not available right now. Please try again later.';
}

export class UpstreamTimeoutError extends AppError {
  override name = 'UpstreamTimeoutError';
  readonly status = 504;
  readonly type = `${PROBLEM_BASE}/upstream-timeout`;
  readonly title = 'Upstream timeout';
  override readonly publicDetail =
    'The bear data source did not answer in time. Please try again later.';
}

export class ServiceUnavailableError extends AppError {
  override name = 'ServiceUnavailableError';
  readonly status = 503;
  readonly type = `${PROBLEM_BASE}/not-ready`;
  readonly title = 'Service not ready';
  override readonly publicDetail =
    'The service cannot reach its database right now.';
}
