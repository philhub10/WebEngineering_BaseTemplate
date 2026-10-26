import { readFileSync } from 'node:fs';
import type { FastifyPluginCallback } from 'fastify';

export interface Health {
  status: 'ok';
  version: string;
  uptime: number;
}

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
  app.get<{ Reply: Health }>(
    '/health',
    {
      schema: {
        response: {
          '2xx': {
            type: 'object',
            required: ['status', 'version', 'uptime'],
            properties: {
              status: { type: 'string', enum: ['ok'] },
              version: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    },
    (_request, reply) => {
      void reply.send({ status: 'ok', version, uptime: process.uptime() });
    }
  );
  done();
};
