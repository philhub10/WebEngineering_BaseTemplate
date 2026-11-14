import { describe, expect, it, onTestFinished } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { MemoryBearRepository } from '../src/repositories/memory/bear-repository.js';
import { MemoryCommentRepository } from '../src/repositories/memory/comment-repository.js';
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
async function setup(): Promise<FastifyInstance> {
  const app = buildApp(
    {},
    {
      repos: {
        bears: new MemoryBearRepository(fixture),
        comments: new MemoryCommentRepository(),
      },
    }
  );
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
