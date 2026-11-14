import { loadEnv } from '../schemas/env.js';
import { fetchBearsFromWikipedia } from '../services/wikipedia-bears.js';
import { DrizzleBearRepository } from '../repositories/drizzle/bear-repository.js';
import { createDb, createPool } from './client.js';

const config = loadEnv();
const fetched = await fetchBearsFromWikipedia(config);

const pool = createPool(config);
try {
  await new DrizzleBearRepository(createDb(pool)).upsertMany(fetched);
  console.log(`seeded ${fetched.length} bears`);
} finally {
  await pool.end();
}
