import { eq } from 'drizzle-orm';
import type { Executor } from '../../db/client.js';
import { users } from '../../db/schema.js';
import type { NewUser, User, UserRepository } from '../user-repository.js';

type UserRow = typeof users.$inferSelect;

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Executor) {}

  async create(input: NewUser): Promise<User | null> {
    // The UNIQUE constraint decides, not a SELECT before the INSERT
    const [row] = await this.db
      .insert(users)
      .values(input)
      .onConflictDoNothing({ target: users.email })
      .returning();
    return row === undefined ? null : toUser(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return row === undefined ? null : toUser(row);
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row === undefined ? null : toUser(row);
  }
}
