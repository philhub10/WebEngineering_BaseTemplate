import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { loadEnv } from '../schemas/env.js';
import { Email } from '../schemas/auth.js';
import { fetchBearsFromWikipedia } from '../services/wikipedia-bears.js';
import { hashPassword } from '../services/auth.js';
import { DrizzleBearRepository } from '../repositories/drizzle/bear-repository.js';
import { DrizzleUserRepository } from '../repositories/drizzle/user-repository.js';
import { createDb, createPool } from './client.js';

const MIN_PASSWORD_LENGTH = 12;
const GENERATED_PASSWORD_BYTES = 18; // 24 characters

const SeedEnv = z.object({
  SEED_MODERATOR_EMAIL: Email.default('moderator@bears.example'),
  SEED_MODERATOR_PASSWORD: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(MIN_PASSWORD_LENGTH).optional()
  ),
});

const config = loadEnv();
const seedEnv = SeedEnv.parse(process.env);
const fetched = await fetchBearsFromWikipedia(config);

const pool = createPool(config);
try {
  const db = createDb(pool);
  await new DrizzleBearRepository(db).upsertMany(fetched);
  console.log(`seeded ${fetched.length} bears`);

  const users = new DrizzleUserRepository(db);
  const { SEED_MODERATOR_EMAIL: email } = seedEnv;
  const existing = await users.findByEmail(email);
  if (existing === null) {
    const password =
      seedEnv.SEED_MODERATOR_PASSWORD ??
      randomBytes(GENERATED_PASSWORD_BYTES).toString('base64url');
    await users.create({
      email,
      passwordHash: await hashPassword(password),
      role: 'moderator',
    });
    console.log(
      seedEnv.SEED_MODERATOR_PASSWORD === undefined
        ? `created moderator ${email} with password ${password} (shown once)`
        : `created moderator ${email}`
    );
  } else if (existing.role === 'moderator') {
    // A set password always wins, so changing it in .env takes effect.
    if (seedEnv.SEED_MODERATOR_PASSWORD === undefined) {
      console.log(`moderator ${email} already exists`);
    } else {
      await users.setPasswordHash(
        existing.id,
        await hashPassword(seedEnv.SEED_MODERATOR_PASSWORD)
      );
      console.log(`moderator ${email}: password set from the environment`);
    }
  } else {
    // Someone registered this address first: promoting it would hand them
    // the moderator role.
    throw new Error(`${email} exists as a normal user, not promoting it`);
  }
} finally {
  await pool.end();
}
