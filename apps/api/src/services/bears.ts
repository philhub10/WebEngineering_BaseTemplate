import { asc, eq } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { bears } from '../db/schema.js';
import { NotFoundError } from '../errors.js';
import type { Bear } from '../schemas/bear.js';

const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

export async function loadBears(db: Db): Promise<Bear[]> {
  return await db.select(bearColumns).from(bears).orderBy(asc(bears.position));
}

export async function loadBear(db: Db, id: string): Promise<Bear> {
  const [bear] = await db
    .select(bearColumns)
    .from(bears)
    .where(eq(bears.id, id));
  if (bear === undefined) {
    throw new NotFoundError(`No bear with id "${id}"`);
  }
  return bear;
}
