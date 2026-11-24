import { randomUUID } from 'node:crypto';
import type { NewUser, User, UserRepository } from '../user-repository.js';

export class MemoryUserRepository implements UserRepository {
  // Keyed by the canonical e-mail address, like the UNIQUE constraint.
  private readonly users = new Map<string, User>();

  async create(input: NewUser): Promise<User | null> {
    if (this.users.has(input.email)) {
      return null;
    }
    const user: User = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.email, user);
    return await Promise.resolve(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await Promise.resolve(this.users.get(email) ?? null);
  }
}
