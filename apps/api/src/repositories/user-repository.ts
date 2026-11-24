import type { PublicUser, Role } from '../schemas/auth.js';

// A user as stored, including the hash. Never leaves the server.
export interface User extends PublicUser {
  passwordHash: string;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  role: Role;
}

export interface UserRepository {
  // null if the e-mail address is already taken.
  create: (input: NewUser) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
}
