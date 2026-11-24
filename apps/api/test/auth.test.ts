import { describe, expect, it } from 'vitest';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { createMemoryRepos } from '../src/repositories/memory/index.js';
import { createModerator, fixture, setup, signIn } from './helpers.js';
import type { Session } from './helpers.js';

describe('register', () => {
  const url = '/api/auth/register';
  const payload = {
    email: 'lena@example.org',
    password: 'correct horse battery staple',
  };

  it('creates a user and stores only an argon2id hash', async () => {
    const repos = createMemoryRepos(fixture);
    const app = await setup(repos);
    const res = await app.inject({ method: 'POST', url, payload });

    expect(res.statusCode).toBe(201);
    const user = res.json<Record<string, unknown>>();
    expect(Object.keys(user).toSorted()).toEqual([
      'createdAt',
      'email',
      'id',
      'role',
    ]);
    expect(user).toMatchObject({ email: 'lena@example.org', role: 'user' });
    expect(res.body).not.toContain(payload.password);

    const stored = await repos.users.findByEmail('lena@example.org');
    expect(stored?.passwordHash).toMatch(
      /^\$argon2id\$v=19\$m=65536,t=3,p=4\$/v
    );
    expect(stored?.passwordHash).not.toContain(payload.password);
  });

  it('salts: the same password gives two different hashes', async () => {
    const repos = createMemoryRepos(fixture);
    const app = await setup(repos);
    await app.inject({ method: 'POST', url, payload });
    await app.inject({
      method: 'POST',
      url,
      payload: { ...payload, email: 'max@example.org' },
    });

    const lena = await repos.users.findByEmail('lena@example.org');
    const max = await repos.users.findByEmail('max@example.org');
    expect(lena?.passwordHash).not.toBe(max?.passwordHash);
  });

  it('answers 409 for a duplicate e-mail, also in another case', async () => {
    const app = await setup();
    await app.inject({ method: 'POST', url, payload });
    const res = await app.inject({
      method: 'POST',
      url,
      payload: { ...payload, email: '  Lena@Example.ORG ' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('answers 400 for a password shorter than 12 characters', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url,
      payload: { ...payload, password: 'Sh0rt!pw' },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json<{ errors: Array<{ path: string }> }>();
    expect(body.errors.map((e) => e.path)).toEqual(['password']);
  });

  it('accepts a long password without digits or symbols', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url,
      payload: { ...payload, password: 'only lowercase letters here' },
    });

    expect(res.statusCode).toBe(201);
  });

  it('answers 400 for an invalid e-mail address', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url,
      payload: { ...payload, email: 'not-an-email' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('rejects a role in the body (mass assignment)', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url,
      payload: { ...payload, role: 'moderator' },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('login and session', () => {
  const credentials = {
    email: 'lena@example.org',
    password: 'correct horse battery staple',
  };

  // Registers Lena and returns her session cookie value.
  async function loginLena(app: FastifyInstance): Promise<string> {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: credentials,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: credentials,
    });
    expect(res.statusCode).toBe(200);
    const sid = res.cookies.find((c) => c.name === 'sid');
    if (sid === undefined) throw new Error('no session cookie');
    return sid.value;
  }

  async function me(
    app: FastifyInstance,
    sid?: string
  ): Promise<LightMyRequestResponse> {
    return await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: sid === undefined ? {} : { sid },
    });
  }

  it('sets an HttpOnly, SameSite=Lax session cookie on login', async () => {
    const app = await setup();
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: credentials,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { ...credentials, email: 'LENA@example.org' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ email: 'lena@example.org' });
    const setCookie = String(res.headers['set-cookie']);
    // Signed with SESSION_SECRET: a forged id fails the signature check.
    expect(setCookie).toMatch(/^sid=[^;]+;/v);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Expires=');
    // Not in production: browsers would drop it on http://localhost.
    expect(setCookie).not.toContain('Secure');
  });

  it('returns the user from /me with the cookie', async () => {
    const app = await setup();
    const sid = await loginLena(app);
    const res = await me(app, sid);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ email: 'lena@example.org' });
  });

  it('answers 401 as a problem from /me without a cookie', async () => {
    const app = await setup();
    const res = await me(app);

    expect(res.statusCode).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('answers 401 from /me for a made-up session id', async () => {
    const app = await setup();
    const res = await me(app, 'not-a-real-session');

    expect(res.statusCode).toBe(401);
  });

  it('invalidates the session on logout, even for a copied cookie', async () => {
    const app = await setup();
    const sid = await loginLena(app);

    const out = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      cookies: { sid },
    });
    expect(out.statusCode).toBe(204);
    expect(String(out.headers['set-cookie'])).toContain('sid=;');

    // The old cookie value, replayed after logout.
    const res = await me(app, sid);
    expect(res.statusCode).toBe(401);
  });

  it('gives a new session id on every login', async () => {
    const app = await setup();
    const first = await loginLena(app);
    const second = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: credentials,
      cookies: { sid: first },
    });
    const next = second.cookies.find((c) => c.name === 'sid')?.value;

    expect(next).toBeDefined();
    expect(next).not.toBe(first);
    // The replaced session is gone.
    expect((await me(app, first)).statusCode).toBe(401);
  });

  it('answers the same 401 for a wrong password and an unknown e-mail', async () => {
    const app = await setup();
    await loginLena(app);

    const wrongPassword = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { ...credentials, password: 'wrong password here' },
    });
    const unknownEmail = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { ...credentials, email: 'nobody@example.org' },
    });

    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownEmail.statusCode).toBe(401);
    const a = wrongPassword.json<{ type: string; detail: string }>();
    const b = unknownEmail.json<{ type: string; detail: string }>();
    expect([b.type, b.detail]).toEqual([a.type, a.detail]);
    expect(wrongPassword.headers['set-cookie']).toBeUndefined();
  });
});

describe('authorisation for comments', () => {
  async function setupWithComment(): Promise<{
    app: FastifyInstance;
    url: string;
    author: Session;
    other: Session;
    moderator: Session;
  }> {
    const repos = createMemoryRepos(fixture);
    const app = await setup(repos);
    await createModerator(repos, 'mod@example.org');
    const author = await signIn(app, 'lena@example.org');
    const other = await signIn(app, 'max@example.org');
    const moderator = await signIn(app, 'mod@example.org');
    const created = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      cookies: author,
      payload: { author: 'Lena', text: 'Mine' },
    });
    const url = `/api/comments/${created.json<{ id: string }>().id}`;
    return { app, url, author, other, moderator };
  }

  it('answers 401 for creating a comment without login', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      payload: { author: 'Lena', text: 'Anonymous' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('stores the logged-in user as author_id, not anything from the body', async () => {
    const app = await setup();
    const lena = await signIn(app, 'lena@example.org');
    const me = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: lena,
    });
    const created = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      cookies: lena,
      payload: { author: 'Moderator', text: 'Hi' },
    });

    expect(created.json()).toMatchObject({
      authorId: me.json<{ id: string }>().id,
    });
  });

  it('DELETE: anonymous 401', async () => {
    const { app, url } = await setupWithComment();
    const res = await app.inject({ method: 'DELETE', url });
    expect(res.statusCode).toBe(401);
  });

  it('DELETE: author 204', async () => {
    const { app, url, author } = await setupWithComment();
    const res = await app.inject({ method: 'DELETE', url, cookies: author });
    expect(res.statusCode).toBe(204);
  });

  it('DELETE: other user 403, the comment stays (IDOR)', async () => {
    const { app, url, other, author } = await setupWithComment();
    const res = await app.inject({ method: 'DELETE', url, cookies: other });

    expect(res.statusCode).toBe(403);
    expect(res.headers['content-type']).toContain('application/problem+json');
    const again = await app.inject({ method: 'DELETE', url, cookies: author });
    expect(again.statusCode).toBe(204);
  });

  it('DELETE: moderator 204', async () => {
    const { app, url, moderator } = await setupWithComment();
    const res = await app.inject({ method: 'DELETE', url, cookies: moderator });
    expect(res.statusCode).toBe(204);
  });

  it('answers 401 for reporting without login', async () => {
    const { app, url } = await setupWithComment();
    const res = await app.inject({ method: 'POST', url: `${url}/report` });
    expect(res.statusCode).toBe(401);
  });
});
