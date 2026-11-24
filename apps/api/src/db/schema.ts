import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const MILLISECOND_PRECISION = 3;
const NO_REPORTS = 0;

export const bears = pgTable('bears', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  binomial: text('binomial').notNull().unique(),
  imageUrl: text('image_url'),
  range: text('range').notNull(),
  position: integer('position').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable(
  'comments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    bearId: text('bear_id')
      .notNull()
      .references(() => bears.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    text: text('text').notNull(),
    // Milliseconds like a JavaScript Date, so a cursor matches exactly.
    createdAt: timestamp('created_at', {
      withTimezone: true,
      precision: MILLISECOND_PRECISION,
    })
      .notNull()
      .defaultNow(),
    reportCount: integer('report_count').notNull().default(NO_REPORTS),
    hiddenAt: timestamp('hidden_at', {
      withTimezone: true,
      precision: MILLISECOND_PRECISION,
    }),
  },
  (table) => [
    index('comments_bear_created_idx').on(
      table.bearId,
      table.createdAt,
      table.id
    ),
    check(
      'comments_author_length',
      sql`char_length(${table.author}) BETWEEN 1 AND 80`
    ),
    check(
      'comments_text_length',
      sql`char_length(${table.text}) BETWEEN 1 AND 2000`
    ),
    check('comments_report_count_non_negative', sql`${table.reportCount} >= 0`),
  ]
);

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['user', 'moderator'] })
      .notNull()
      .default('user'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      precision: MILLISECOND_PRECISION,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check('users_role_valid', sql`${table.role} IN ('user', 'moderator')`),
    check(
      'users_password_hash_argon2',
      sql`${table.passwordHash} LIKE '$argon2%'`
    ),
  ]
);

export const sessions = pgTable(
  'sessions',
  {
    // The store id from the (signed) cookie.
    sid: text('sid').primaryKey(),
    // The whole @fastify/session object: userId, cookie, generation.
    sess: jsonb('sess').notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      precision: MILLISECOND_PRECISION,
    }).notNull(),
  },
  // For the cleanup of expired rows.
  (table) => [index('sessions_expires_idx').on(table.expiresAt)]
);
