import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { bears } from '../../db/schema.js';
import type { Bear } from '../../schemas/bear.js';
import type { BearRepository } from '../bear-repository.js';

const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

export class DrizzleBearRepository implements BearRepository {
  constructor(private readonly db: Db) {}

  async list(): Promise<Bear[]> {
    return await this.db
      .select(bearColumns)
      .from(bears)
      .orderBy(asc(bears.position));
  }

  async findById(id: string): Promise<Bear | null> {
    const [bear] = await this.db
      .select(bearColumns)
      .from(bears)
      .where(eq(bears.id, id));
    return bear ?? null;
  }

  async upsertMany(input: Bear[]): Promise<void> {
    const rows = input.map((bear, position) => ({ ...bear, position }));
    await this.db
      .insert(bears)
      .values(rows)
      .onConflictDoUpdate({
        target: bears.id,
        set: {
          name: sql`excluded.name`,
          binomial: sql`excluded.binomial`,
          imageUrl: sql`excluded.image_url`,
          range: sql`excluded.range`,
          position: sql`excluded.position`,
          fetchedAt: sql`now()`,
        },
      });
  }
}
