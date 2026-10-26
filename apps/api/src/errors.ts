export class NotFoundError extends Error {
  override name = 'NotFoundError';
  readonly statusCode = 404;
}

export class UpstreamError extends Error {
  override name = 'UpstreamError';
  readonly statusCode = 502;
}

export class UpstreamTimeoutError extends Error {
  override name = 'UpstreamTimeoutError';
  readonly statusCode = 504;
}
