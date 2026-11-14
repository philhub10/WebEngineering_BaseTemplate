import { readFileSync } from 'node:fs';
import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { ServiceUnavailableError } from '../errors.js';
import { problemResponses } from '../schemas/problem.js';

const Health = z.object({
  status: z.literal('ok'),
  version: z.string(),
  uptime: z.number(),
});

const Ready = z.object({ status: z.literal('ready') });

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
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.get(
    '/health',
    { schema: { response: { '2xx': Health } } },
    (_request, reply) => {
      void reply.send({ status: 'ok', version, uptime: process.uptime() });
    }
  );

  api.get(
    '/health/ready',
    { schema: { response: { '2xx': Ready, ...problemResponses } } },
    async () => {
      try {
        await app.pool.query('SELECT 1');
      } catch (err) {
        throw new ServiceUnavailableError('Readiness query failed', {
          cause: err,
        });
      }
      return { status: 'ready' as const };
    }
  );

  done();
};
