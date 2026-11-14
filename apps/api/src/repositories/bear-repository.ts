import type { Bear } from '../schemas/bear.js';

export interface BearRepository {
  list: () => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | null>;
  upsertMany: (bears: Bear[]) => Promise<void>;
}
