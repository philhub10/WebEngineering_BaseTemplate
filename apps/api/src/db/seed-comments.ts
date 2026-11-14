import { sql } from 'drizzle-orm';
import { loadEnv } from '../schemas/env.js';
import { createDb, createPool } from './client.js';

const COMMENT_COUNT = 100_000;

// Generates the comments inside PostgreSQL in one statement, the same number
// per bear. Within a bear the number matches the time: the highest number is
// the newest, one minute apart, so newest first reads 12500, 12499, ...
// Earlier seed comments are deleted first, so the script can run again.
const pool = createPool(loadEnv());
try {
  const db = createDb(pool);
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM comments WHERE author LIKE 'Seed user %'`);
    return await tx.execute(sql`
      WITH per_bear AS (
        SELECT ${COMMENT_COUNT} / count(*) AS total FROM bears HAVING count(*) > 0
      )
      INSERT INTO comments (bear_id, author, text, created_at)
      SELECT b.id,
             'Seed user ' || n,
             'Seeded comment number ' || n,
             now() - (per_bear.total - n) * interval '1 minute'
      FROM per_bear, bears AS b, generate_series(1, per_bear.total) AS n
    `);
  });
  await db.execute(sql`ANALYZE comments`);
  console.log(`inserted ${String(result.rowCount)} comments`);
} finally {
  await pool.end();
}
