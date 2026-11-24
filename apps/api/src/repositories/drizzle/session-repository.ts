import { and, eq, gt, sql } from 'drizzle-orm';
import type { Executor } from '../../db/client.js';
import { sessions } from '../../db/schema.js';
import { GENERATION_KEY } from '../session-repository.js';
import type { SessionData, SessionRepository } from '../session-repository.js';

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: Executor) {}

  async get(sid: string, now: Date): Promise<SessionData | null> {
    const [row] = await this.db
      .select({ sess: sessions.sess })
      .from(sessions)
      .where(and(eq(sessions.sid, sid), gt(sessions.expiresAt, now)));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- jsonb we wrote ourselves in set()
    return row === undefined ? null : (row.sess as SessionData);
  }

  async set(sid: string, data: SessionData, expiresAt: Date): Promise<void> {
    await this.db
      .insert(sessions)
      .values({ sid, sess: data, expiresAt })
      .onConflictDoUpdate({
        target: sessions.sid,
        set: { sess: data, expiresAt },
      });
  }

  async compareAndSet(
    sid: string,
    expectedGeneration: string,
    data: SessionData,
    expiresAt: Date
  ): Promise<boolean> {
    // Check and write in one statement: no gap for a concurrent regenerate.
    const generation = sql`coalesce(${sessions.sess} -> ${GENERATION_KEY} ->> 'generation', ${sessions.sid})`;
    const [updated] = await this.db
      .update(sessions)
      .set({ sess: data, expiresAt })
      .where(and(eq(sessions.sid, sid), eq(generation, expectedGeneration)))
      .returning({ sid: sessions.sid });
    return updated !== undefined;
  }

  async destroy(sid: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.sid, sid));
  }
}
