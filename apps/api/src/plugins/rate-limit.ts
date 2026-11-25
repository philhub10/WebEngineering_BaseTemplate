import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { RateLimitOptions } from '@fastify/rate-limit';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { TooManyRequestsError } from '../errors.js';

function emailOf(request: FastifyRequest): string {
  const { body } = request;
  return typeof body === 'object' &&
    body !== null &&
    'email' in body &&
    typeof body.email === 'string'
    ? body.email
    : '';
}

const LOGIN_ATTEMPTS_PER_MINUTE = 10;
const REGISTRATIONS_PER_HOUR = 10;

export const loginRateLimit: RateLimitOptions = {
  max: LOGIN_ATTEMPTS_PER_MINUTE,
  timeWindow: '1 minute',
  hook: 'preHandler',
  keyGenerator: (request) => `${request.ip}:${emailOf(request)}`,
};

export const registerRateLimit: RateLimitOptions = {
  max: REGISTRATIONS_PER_HOUR,
  timeWindow: '1 hour',
};

// Only routes with config.rateLimit are limited.
const rateLimitConfig: FastifyPluginAsync = async (app) => {
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: (_request, context) =>
      new TooManyRequestsError(
        `Too many attempts. Try again in ${context.after}.`
      ),
  });
};

export const rateLimitPlugin = fp(rateLimitConfig, {
  name: 'rate-limit',
  fastify: '5.x',
});
