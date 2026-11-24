import { onTestFinished } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { createMemoryRepos } from '../src/repositories/memory/index.js';
import type { Repos } from '../src/repositories/index.js';
import type { Bear } from '../src/schemas/bear.js';
import { hashPassword } from '../src/services/auth.js';

export const fixture: Bear[] = [
  {
    id: 'ailuropoda-melanoleuca',
    name: 'Giant panda',
    binomial: 'Ailuropoda melanoleuca',
    imageUrl: null,
    range: 'Central China',
  },
  {
    id: 'ursus-arctos',
    name: 'Brown bear',
    binomial: 'Ursus arctos',
    imageUrl: 'https://upload.wikimedia.org/brown-bear.jpg',
    range: 'Eurasia and North America',
  },
];

// A fresh app with in-memory repositories per test: no database needed.
export async function setup(
  repos: Repos = createMemoryRepos(fixture)
): Promise<FastifyInstance> {
  const app = buildApp({}, { repos });
  await app.ready();
  onTestFinished(async () => {
    await app.close();
  });
  return app;
}

export const PASSWORD = 'correct horse battery staple';

// The session cookie, ready for inject({ cookies }): { sid: '...' }.
export type Session = Record<string, string>;

// Registers the address (a 409 if it exists is fine) and logs in.
export async function signIn(
  app: FastifyInstance,
  email: string
): Promise<Session> {
  await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email, password: PASSWORD },
  });
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email, password: PASSWORD },
  });
  const sid = res.cookies.find((c) => c.name === 'sid')?.value;
  if (sid === undefined) throw new Error(`login failed for ${email}`);
  return { sid };
}

// A moderator cannot register (role is server-owned): created directly.
export async function createModerator(
  repos: Repos,
  email: string
): Promise<void> {
  await repos.users.create({
    email,
    passwordHash: await hashPassword(PASSWORD),
    role: 'moderator',
  });
}
