const PROBLEM_CONTENT_TYPE = 'application/problem+json';
const SERVER_ERROR = 500;

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Array<{ path: string; message: string }>;
}

export class ApiError extends Error {
  override name = 'ApiError';

  constructor(
    readonly status: number,
    readonly detail: string,
    readonly requestId: string | null,
    readonly problem: Problem | null
  ) {
    super(detail);
  }
}

function isProblem(value: unknown): value is Problem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'status' in value &&
    typeof value.status === 'number'
  );
}

async function readProblem(res: Response): Promise<Problem | null> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes(PROBLEM_CONTENT_TYPE)) {
    return null;
  }
  try {
    const body: unknown = await res.json();
    return isProblem(body) ? body : null;
  } catch {
    return null;
  }
}

// Builds an ApiError from a failed response
export async function toApiError(res: Response): Promise<ApiError> {
  const problem = await readProblem(res);
  const detail =
    problem?.detail ??
    problem?.title ??
    `The request failed with status ${res.status}.`;
  return new ApiError(
    res.status,
    detail,
    res.headers.get('x-request-id'),
    problem
  );
}

// The text to show the user for any error thrown while calling the API.
// For server errors the request id is added
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  if (error.status >= SERVER_ERROR && error.requestId !== null) {
    return `${error.detail} (Reference: ${error.requestId})`;
  }
  return error.detail;
}
