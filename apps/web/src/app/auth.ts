import { apiUrl } from './api';
import { toApiError } from './problem';

const UNAUTHORIZED = 401;

export interface User {
  id: string;
  email: string;
  role: 'user' | 'moderator';
  createdAt: string;
}

// What the register and login forms send to the API.
export interface Credentials {
  email: string;
  password: string;
}

// 'include' sends the session cookie also in the cross-origin build.
const withCookie = { credentials: 'include' } as const;

async function postCredentials(
  path: string,
  credentials: Credentials
): Promise<User> {
  const res = await fetch(apiUrl(path), {
    ...withCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as User;
}

export async function register(credentials: Credentials): Promise<User> {
  return await postCredentials('/api/auth/register', credentials);
}

export async function login(credentials: Credentials): Promise<User> {
  return await postCredentials('/api/auth/login', credentials);
}

export async function logout(): Promise<void> {
  const res = await fetch(apiUrl('/api/auth/logout'), {
    ...withCookie,
    method: 'POST',
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
}

// The logged-in user, or null if there is no valid session.
export async function loadCurrentUser(): Promise<User | null> {
  const res = await fetch(apiUrl('/api/auth/me'), withCookie);
  if (res.status === UNAUTHORIZED) {
    return null;
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the API validated the data with zod.
  return (await res.json()) as User;
}
