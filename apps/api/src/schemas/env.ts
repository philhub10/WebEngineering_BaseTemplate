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
});

export type Env = z.infer<typeof Env>;

export function loadEnv(): Env {
  return Env.parse(process.env);
}
