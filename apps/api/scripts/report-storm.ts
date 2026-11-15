import { z } from 'zod';
import { createDb, createPool } from '../src/db/client.js';
import { DrizzleCommentRepository } from '../src/repositories/drizzle/comment-repository.js';
import { loadEnv } from '../src/schemas/env.js';

// Sends 50 concurrent reports for one new comment and prints the final
// report_count from the database.
//   npm run report:storm              -> fixed route (transaction + FOR UPDATE)
//   npm run report:storm -- --naive   -> naive debug route (lost update)
// Needs the API running with ENABLE_DEBUG_ROUTES=true for --naive (npm run dev).

const REPORTS = 50;
const BEAR_ID = 'ursus-arctos';

const apiUrl = z
  .url()
  .default('http://localhost:3000')
  .parse(process.env.API_URL);
const naive = process.argv.includes('--naive');

const created = await fetch(`${apiUrl}/api/bears/${BEAR_ID}/comments`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ author: 'Report storm', text: 'Please report me' }),
});
if (!created.ok) {
  throw new Error(`creating the comment failed: ${created.status}`);
}
const { id } = z.object({ id: z.uuid() }).parse(await created.json());

const reportUrl = naive
  ? `${apiUrl}/api/debug/comments/${id}/report-naive`
  : `${apiUrl}/api/comments/${id}/report`;

console.log(
  `${naive ? 'NAIVE' : 'FIXED'}: ${REPORTS} concurrent reports for ${id}`
);

// All requests start before the first one is answered.
const responses = await Promise.all(
  Array.from(
    { length: REPORTS },
    async () => await fetch(reportUrl, { method: 'POST' })
  )
);
const statuses = Map.groupBy(responses, (res) => res.status);
for (const [status, list] of statuses) {
  console.log(`  HTTP ${status}: ${list.length} responses`);
}

const pool = createPool(loadEnv());
try {
  const comment = await new DrizzleCommentRepository(createDb(pool)).findById(
    id
  );
  const count = comment?.reportCount ?? Number.NaN;
  console.log(`  final report_count: ${count} (expected ${REPORTS})`);
  console.log(`  lost updates:       ${REPORTS - count}`);
  console.log(`  hidden_at:          ${comment?.hiddenAt ?? 'null'}`);
} finally {
  await pool.end();
}
