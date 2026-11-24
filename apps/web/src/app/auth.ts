import { apiUrl } from './api';
import { toApiError } from './problem';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'moderator';
  createdAt: string;
}

// What the register form sends to the API.
export interface Credentials {
  email: string;
  password: string;
}

export async function register(credentials: Credentials): Promise<User> {
  const res = await fetch(apiUrl('/api/auth/register'), {
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
