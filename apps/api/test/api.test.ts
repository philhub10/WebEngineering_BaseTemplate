import { describe, expect, it, onTestFinished } from 'vitest';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { buildApp } from '../src/app.js';
import { createMemoryRepos } from '../src/repositories/memory/index.js';
import type { Repos } from '../src/repositories/index.js';
import type { Bear } from '../src/schemas/bear.js';

interface CommentPageBody {
  items: Array<{ id: string }>;
  nextCursor: string | null;
}

const fixture: Bear[] = [
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
async function setup(
  repos: Repos = createMemoryRepos(fixture)
): Promise<FastifyInstance> {
  const app = buildApp({}, { repos });
  await app.ready();
  onTestFinished(async () => {
    await app.close();
  });
  return app;
}

describe('bears', () => {
  it('lists the bears in their stored order', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/bears' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(fixture);
  });

  it('returns one bear by id', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'GET',
      url: '/api/bears/ursus-arctos',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(fixture[1]);
  });

  it('answers 404 as a problem for an unknown bear', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'GET',
      url: '/api/bears/teddy-bear',
    });

    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('filters by name with ?q=, case-insensitive', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/bears?q=BROWN' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([fixture[1]]);
  });

  it('returns an empty list if no name matches', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/bears?q=teddy' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});

describe('comments', () => {
  const payload = { author: 'Lena', text: 'Saw one in Slovenia' };

  it('creates a comment and lists it for its bear', async () => {
    const app = await setup();
    const created = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      payload,
    });

    expect(created.statusCode).toBe(201);
    const comment = created.json<{ id: string }>();
    expect(created.headers.location).toBe(`/api/comments/${comment.id}`);

    const list = await app.inject({
      method: 'GET',
      url: '/api/bears/ursus-arctos/comments',
    });
    expect(list.json()).toEqual({ items: [comment], nextCursor: null });
  });

  it('answers 400 for an empty text', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      payload: { author: 'Lena', text: '   ' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('answers 404 when commenting on an unknown bear', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/bears/teddy-bear/comments',
      payload,
    });

    expect(res.statusCode).toBe(404);
  });

  it('deletes a comment once, then answers 404', async () => {
    const app = await setup();
    const created = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      payload,
    });
    const url = `/api/comments/${created.json<{ id: string }>().id}`;

    const first = await app.inject({ method: 'DELETE', url });
    const second = await app.inject({ method: 'DELETE', url });

    expect(first.statusCode).toBe(204);
    expect(second.statusCode).toBe(404);
  });

  it('pages through comments with limit and nextCursor', async () => {
    const app = await setup();
    const ids: string[] = [];
    for (const text of ['first', 'second', 'third']) {
      // eslint-disable-next-line no-await-in-loop -- one after another on purpose, like real users
      const created = await app.inject({
        method: 'POST',
        url: '/api/bears/ursus-arctos/comments',
        payload: { author: 'Lena', text },
      });
      ids.push(created.json<{ id: string }>().id);
    }

    const first = await app.inject({
      method: 'GET',
      url: '/api/bears/ursus-arctos/comments?limit=2',
    });
    const page1 = first.json<CommentPageBody>();
    expect(first.statusCode).toBe(200);
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toEqual(expect.any(String));

    const second = await app.inject({
      method: 'GET',
      url: `/api/bears/ursus-arctos/comments?limit=2&cursor=${String(page1.nextCursor)}`,
    });
    const page2 = second.json<CommentPageBody>();
    expect(page2.items).toHaveLength(1);
    expect(page2.nextCursor).toBeNull();

    // Every comment exactly once across both pages.
    const seen = [...page1.items, ...page2.items].map((c) => c.id);
    expect(seen.toSorted()).toEqual(ids.toSorted());
  });

  it('answers 400 for an invalid cursor', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'GET',
      url: '/api/bears/ursus-arctos/comments?cursor=not-a-cursor',
    });

    expect(res.statusCode).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('answers 400 for a limit out of range', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'GET',
      url: '/api/bears/ursus-arctos/comments?limit=0',
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('reports', () => {
  async function createComment(app: FastifyInstance): Promise<string> {
    const res = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      payload: { author: 'Lena', text: 'Report me' },
    });
    return res.json<{ id: string }>().id;
  }

  it('counts reports and hides the comment at the third', async () => {
    const app = await setup();
    const id = await createComment(app);
    const url = `/api/comments/${id}/report`;

    const first = await app.inject({ method: 'POST', url });
    expect(first.statusCode).toBe(200);
    expect(first.json()).toMatchObject({ reportCount: 1, hiddenAt: null });

    await app.inject({ method: 'POST', url });
    const third = await app.inject({ method: 'POST', url });
    const reported = third.json<{
      reportCount: number;
      hiddenAt: string | null;
    }>();
    expect(reported.reportCount).toBe(3);
    expect(reported.hiddenAt).not.toBeNull();

    const list = await app.inject({
      method: 'GET',
      url: '/api/bears/ursus-arctos/comments',
    });
    expect(list.json<CommentPageBody>().items).toEqual([]);
  });

  it('counts 50 concurrent reports exactly once each', async () => {
    const app = await setup();
    const id = await createComment(app);
    const url = `/api/comments/${id}/report`;

    const responses = await Promise.all(
      Array.from(
        { length: 50 },
        async () => await app.inject({ method: 'POST', url })
      )
    );
    const counts = responses.map(
      (res) => res.json<{ reportCount: number }>().reportCount
    );

    // Every report saw the previous one: 1, 2, ..., 50 without gaps.
    expect(counts.toSorted((a, b) => a - b)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1)
    );
  });

  it('answers 404 when reporting an unknown comment', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/comments/00000000-0000-4000-8000-000000000000/report',
    });

    expect(res.statusCode).toBe(404);
  });
});

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
