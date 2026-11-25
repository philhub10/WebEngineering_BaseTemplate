import { describe, expect, it } from 'vitest';
import type { LightMyRequestResponse } from 'fastify';
import { Env } from '../src/schemas/env.js';
import { setup, signIn } from './helpers.js';

describe('security headers', () => {
  it('sends the helmet headers with a strict CSP on API responses', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/bears' });

    expect(res.headers).toMatchObject({
      'content-security-policy': "default-src 'none';frame-ancestors 'none'",
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'referrer-policy': 'no-referrer',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-resource-policy': 'same-origin',
      'x-xss-protection': '0',
    });
    expect(res.headers['strict-transport-security']).toContain('max-age=');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('sends them on errors too', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/nope' });

    expect(res.statusCode).toBe(404);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain(
      "default-src 'none'"
    );
  });

  it('gives /api/docs its own CSP that lets the Swagger UI load', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/docs' });

    expect(res.statusCode).toBe(200);
    // Scripts and styles from the API's own origin, nothing else.
    expect(res.headers['content-security-policy']).toContain(
      "default-src 'self'"
    );
    expect(res.headers['content-security-policy']).toContain(
      "script-src 'self'"
    );
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('CORS', () => {
  const allowed = 'http://localhost:4173'; // the default CORS_ORIGINS
  const evil = 'https://evil.example';

  async function preflight(origin: string): Promise<LightMyRequestResponse> {
    const app = await setup();
    return await app.inject({
      method: 'OPTIONS',
      url: '/api/comments/00000000-0000-4000-8000-000000000000',
      headers: {
        origin,
        'access-control-request-method': 'DELETE',
        'access-control-request-headers': 'content-type',
      },
    });
  }

  it('allows a preflight from the allow-listed origin, with credentials', async () => {
    const res = await preflight(allowed);

    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(allowed);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-allow-methods']).toBe(
      'GET, POST, DELETE'
    );
    expect(res.headers.vary).toContain('Origin');
  });

  // Allow-Credentials alone grants nothing: the browser only releases the
  // answer if Allow-Origin matches the page's origin exactly.
  it('gives a foreign origin no Allow-Origin, so the browser blocks it', async () => {
    const res = await preflight(evil);

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('never answers with "*" and exposes Retry-After', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'GET',
      url: '/api/bears',
      headers: { origin: allowed },
    });

    expect(res.headers['access-control-allow-origin']).toBe(allowed);
    expect(res.headers['access-control-expose-headers']).toContain(
      'retry-after'
    );
  });

  it.each([
    '*',
    'http://localhost:4173/',
    'https://bears.example/app',
    'ftp://bears.example',
  ])('rejects CORS_ORIGINS=%s at startup', (value) => {
    const result = Env.safeParse({
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
      CORS_ORIGINS: value,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a comma-separated list of origins', () => {
    const result = Env.safeParse({
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
      CORS_ORIGINS: 'http://localhost:4173, https://bears.example',
    });
    expect(result.data?.CORS_ORIGINS).toEqual([
      'http://localhost:4173',
      'https://bears.example',
    ]);
  });
});

describe('body limit', () => {
  it('answers 413 as a problem for a body over 16 KB', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'lena@example.org',
        password: 'x'.repeat(20_000),
      },
    });

    expect(res.statusCode).toBe(413);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('still accepts the largest valid comment', async () => {
    const app = await setup();
    const lena = await signIn(app, 'lena@example.org');
    const res = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      cookies: lena,
      // 2 bytes per character in UTF-8: ~4 KB of text.
      payload: { author: 'Ä'.repeat(80), text: 'ü'.repeat(2000) },
    });

    expect(res.statusCode).toBe(201);
  });
});

describe('input validation', () => {
  it('rejects unknown fields in a comment (mass assignment)', async () => {
    const app = await setup();
    const lena = await signIn(app, 'lena@example.org');
    const res = await app.inject({
      method: 'POST',
      url: '/api/bears/ursus-arctos/comments',
      cookies: lena,
      payload: {
        author: 'Lena',
        text: 'Hi',
        authorId: '00000000-0000-4000-8000-000000000000',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<{ detail: string }>().detail).toContain('authorId');
  });

  // Fastify's router already stops params over 100 characters with 414
  // (maxParamLength); BearId.max(100) states the same limit in the contract.
  it('rejects a bear id longer than 100 characters', async () => {
    const app = await setup();
    const tooLong = await app.inject({
      method: 'GET',
      url: `/api/bears/${'a'.repeat(101)}`,
    });
    const longest = await app.inject({
      method: 'GET',
      url: `/api/bears/${'a'.repeat(100)}`,
    });

    expect(tooLong.statusCode).toBe(414);
    expect(tooLong.headers['content-type']).toContain(
      'application/problem+json'
    );
    expect(tooLong.headers['x-request-id']).toEqual(expect.any(String));
    expect(longest.statusCode).toBe(404); // valid id, unknown bear
  });

  it('rejects a body on routes that take none', async () => {
    const app = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      payload: { anything: true },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<{ detail: string }>().detail).toBe(
      'the request body must be empty'
    );
  });

  it('still generates the OpenAPI document', async () => {
    const app = await setup();
    const res = await app.inject({ method: 'GET', url: '/api/docs/json' });

    expect(res.statusCode).toBe(200);
  });
});
