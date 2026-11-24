import { z } from 'zod';

const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export const Role = z.enum(['user', 'moderator']);

export type Role = z.infer<typeof Role>;

// Canonicalised before it is validated
export const Email = z
  .string('must be a string')
  .trim()
  .toLowerCase()
  .max(MAX_EMAIL_LENGTH, `must be at most ${MAX_EMAIL_LENGTH} characters`)
  .pipe(z.email('must be a valid e-mail address'));

// Strict: an extra field such as "role" is a 400, not silently accepted
export const RegisterBody = z.strictObject({
  email: Email,
  password: z
    .string('must be a string')
    .min(
      MIN_PASSWORD_LENGTH,
      `must be at least ${MIN_PASSWORD_LENGTH} characters`
    )
    .max(
      MAX_PASSWORD_LENGTH,
      `must be at most ${MAX_PASSWORD_LENGTH} characters`
    ),
});

export type RegisterBody = z.infer<typeof RegisterBody>;

// What the API returns about a user: never the password hash.
export const PublicUser = z.object({
  id: z.uuid(),
  email: z.email(),
  role: Role,
  createdAt: z.iso.datetime(),
});

export type PublicUser = z.infer<typeof PublicUser>;
