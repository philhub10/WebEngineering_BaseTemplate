// A session as @fastify/session serialises it (JSON).
export type SessionData = Record<string, unknown>;

// Where @fastify/session keeps the generation inside the session object.
export const GENERATION_KEY = '__fastifySessionMetadata';

function readGeneration(metadata: unknown): string | null {
  if (
    typeof metadata === 'object' &&
    metadata !== null &&
    'generation' in metadata &&
    typeof metadata.generation === 'string'
  ) {
    return metadata.generation;
  }
  return null;
}

// Like the library: without metadata, the generation is the store id.
export function generationOf(sid: string, data: SessionData): string {
  return readGeneration(data[GENERATION_KEY]) ?? sid;
}

export interface SessionRepository {
  // null if unknown or expired.
  get: (sid: string, now: Date) => Promise<SessionData | null>;
  set: (sid: string, data: SessionData, expiresAt: Date) => Promise<void>;
  // Only writes if the stored generation is still the expected one.
  compareAndSet: (
    sid: string,
    expectedGeneration: string,
    data: SessionData,
    expiresAt: Date
  ) => Promise<boolean>;
  destroy: (sid: string) => Promise<void>;
}
