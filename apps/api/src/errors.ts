export const PROBLEM_BASE = 'https://bears.example/problems';

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly type: string;
  abstract readonly title: string;
  readonly publicDetail: string | null = null;
}

export class NotFoundError extends AppError {
  override name = 'NotFoundError';
  readonly status = 404;
  readonly type = `${PROBLEM_BASE}/not-found`;
  readonly title = 'Resource not found';
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
