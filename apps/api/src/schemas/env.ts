import { z } from 'zod';

const DEFAULT_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;
const DEFAULT_DB_POOL_MAX = 10;
const DEFAULT_DB_CONNECTION_TIMEOUT_MS = 2_000;
const MIN_SESSION_SECRET_LENGTH = 32;

export const Env = z
  .object({
    // Only "production" sets the Secure flag on the session cookie.
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    HOST: z.string().nonempty().default('0.0.0.0'),
    PORT: z.coerce
      .number()
      .int()
      .min(MIN_PORT)
      .max(MAX_PORT)
      .default(DEFAULT_PORT),
    WIKIPEDIA_BASE_URL: z.url().default('https://en.wikipedia.org'),
    USER_AGENT: z
      .string()
      .nonempty()
      .default(
        'BearApp/0.1 (https://github.com/philhub10/WebEngineering_BaseTemplate; philhub10@gmail.com)'
      ),
    ENABLE_DEBUG_ROUTES: z.stringbool().default(true),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:4173')
      .transform((value) => value.split(',').map((origin) => origin.trim()))
      .pipe(z.array(z.url())),
    DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/v }),
    DB_POOL_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_DB_POOL_MAX),
    DB_CONNECTION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_DB_CONNECTION_TIMEOUT_MS),
    // Signs the session cookie. Optional outside production (see session.ts).
    SESSION_SECRET: z
      .string()
      .min(
        MIN_SESSION_SECRET_LENGTH,
        `must be at least ${MIN_SESSION_SECRET_LENGTH} characters`
      )
      .optional(),
  })
  .refine(
    (env) => env.NODE_ENV !== 'production' || env.SESSION_SECRET !== undefined,
    { path: ['SESSION_SECRET'], message: 'is required in production' }
  );

export type Env = z.infer<typeof Env>;

export function loadEnv(): Env {
  return Env.parse(process.env);
}
