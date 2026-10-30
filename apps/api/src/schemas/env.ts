import { z } from 'zod';

const DEFAULT_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;

export const Env = z.object({
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
});

export type Env = z.infer<typeof Env>;

export function loadEnv(): Env {
  return Env.parse(process.env);
}
