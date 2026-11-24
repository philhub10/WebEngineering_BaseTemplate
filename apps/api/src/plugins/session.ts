import { randomBytes } from 'node:crypto';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import type { SessionStore } from '@fastify/session';
import type { FastifyInstance, FastifyPluginAsync, Session } from 'fastify';
import type {
  SessionData,
  SessionRepository,
} from '../repositories/session-repository.js';

declare module 'fastify' {
  interface Session {
    userId?: string;
  }
}

export const SESSION_COOKIE = 'sid';
const SESSION_TTL_MS = 28_800_000; // 8 hours
const FALLBACK_SECRET_BYTES = 32;

// @fastify/session treats ENOENT as "session gone": it clears the cookie.
class SessionGoneError extends Error {
  readonly code = 'ENOENT';
}

// Plain JSON: cookie (with expires), userId and the library's generation.
function toData(session: Session): SessionData {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- JSON of an object is an object
  return JSON.parse(JSON.stringify(session)) as SessionData;
}

function expiresAt(session: Session): Date {
  return session.cookie.expires ?? new Date(Date.now() + SESSION_TTL_MS);
}

function toSession(data: SessionData | null): Session | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- written by set()/compareAndSet()
  return data as Session | null;
}

const FAILED: unique symbol = Symbol('failed');

// Reports a promise's outcome to a Node-style callback, exactly once.
async function toCallback<T>(
  work: Promise<T>,
  callback: (err: unknown, result?: T) => void
): Promise<void> {
  const result: T | typeof FAILED = await work.catch((err: unknown) => {
    callback(err);
    return FAILED;
  });
  if (result !== FAILED) {
    callback(null, result);
  }
}

// Adapter: the library's callback interface on top of our repository.
class RepositorySessionStore implements SessionStore {
  constructor(private readonly sessions: SessionRepository) {}

  set(sid: string, session: Session, callback: (err?: unknown) => void): void {
    void toCallback(
      this.sessions.set(sid, toData(session), expiresAt(session)),
      callback
    );
  }

  get(
    sid: string,
    callback: (err: unknown, result?: Session | null) => void
  ): void {
    void toCallback(
      this.sessions.get(sid, new Date()).then(toSession),
      callback
    );
  }

  compareAndSet(
    sid: string,
    expectedGeneration: string,
    session: Session,
    callback: (err?: unknown) => void
  ): void {
    const stillCurrent = this.sessions.compareAndSet(
      sid,
      expectedGeneration,
      toData(session),
      expiresAt(session)
    );
    void toCallback(
      stillCurrent.then((updated) => {
        if (!updated) throw new SessionGoneError('session changed');
      }),
      callback
    );
  }

  destroy(sid: string, callback: (err?: unknown) => void): void {
    void toCallback(this.sessions.destroy(sid), callback);
  }
}

// Allowed outside production only (env.ts): logins end on restart.
function randomSecret(app: FastifyInstance): string {
  app.log.warn('SESSION_SECRET is not set, using a random secret');
  return randomBytes(FALLBACK_SECRET_BYTES).toString('base64url');
}

const session: FastifyPluginAsync = async (app) => {
  const secret = app.config.SESSION_SECRET ?? randomSecret(app);

  await app.register(cookie);
  await app.register(fastifySession, {
    secret,
    cookieName: SESSION_COOKIE,
    store: new RepositorySessionStore(app.repos.sessions),
    cookie: {
      httpOnly: true, // not readable by document.cookie, so XSS cannot copy it
      secure: app.config.NODE_ENV === 'production', // dropped on http:// otherwise
      sameSite: 'lax', // not sent on cross-site POSTs (CSRF baseline)
      path: '/',
      maxAge: SESSION_TTL_MS,
    },
    saveUninitialized: false, // no cookie before login
    rolling: false, // fixed 8 h, no database write on every request
  });
};

export const sessionPlugin = fp(session, {
  name: 'session',
  fastify: '5.x',
  dependencies: ['config', 'repositories'],
});
