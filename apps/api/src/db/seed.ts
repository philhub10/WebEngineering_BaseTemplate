import { sql } from 'drizzle-orm';
import { loadEnv } from '../schemas/env.js';
import { fetchBearsFromWikipedia } from '../services/wikipedia-bears.js';
import { createDb, createPool } from './client.js';
import { bears } from './schema.js';

const config = loadEnv();
const fetched = await fetchBearsFromWikipedia(config);

const pool = createPool(config);
try {
  const rows = fetched.map((bear, position) => ({ ...bear, position }));
  await createDb(pool)
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
  console.log(`seeded ${rows.length} bears`);
} finally {
  await pool.end();
}
