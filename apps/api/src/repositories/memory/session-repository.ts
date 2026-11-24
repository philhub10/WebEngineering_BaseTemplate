import { generationOf } from '../session-repository.js';
import type { SessionData, SessionRepository } from '../session-repository.js';

interface StoredSession {
  data: SessionData;
  expiresAt: Date;
}

export class MemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, StoredSession>();

  async get(sid: string, now: Date): Promise<SessionData | null> {
    const stored = this.sessions.get(sid);
    if (stored === undefined || stored.expiresAt <= now) {
      return null;
    }
    return await Promise.resolve(stored.data);
  }

  async set(sid: string, data: SessionData, expiresAt: Date): Promise<void> {
    this.sessions.set(sid, { data, expiresAt });
    await Promise.resolve();
  }

  async compareAndSet(
    sid: string,
    expectedGeneration: string,
    data: SessionData,
    expiresAt: Date
  ): Promise<boolean> {
    const stored = this.sessions.get(sid);
    if (
      stored === undefined ||
      generationOf(sid, stored.data) !== expectedGeneration
    ) {
      return false;
    }
    this.sessions.set(sid, { data, expiresAt });
    return await Promise.resolve(true);
  }

  async destroy(sid: string): Promise<void> {
    this.sessions.delete(sid);
    await Promise.resolve();
  }
}
