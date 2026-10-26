import { readFileSync } from 'node:fs';
import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';

const Health = z.object({
  status: z.literal('ok'),
  version: z.string(),
  uptime: z.number(),
});

function readVersion(): string {
  const parsed: unknown = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
  );
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'version' in parsed &&
    typeof parsed.version === 'string'
  ) {
    return parsed.version;
  }
  throw new Error('package.json has no version');
}

const version = readVersion();

export const healthRoutes: FastifyPluginCallback = (app, _options, done) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/health',
      { schema: { response: { '2xx': Health } } },
      (_request, reply) => {
        void reply.send({ status: 'ok', version, uptime: process.uptime() });
      }
    );
  done();
};
