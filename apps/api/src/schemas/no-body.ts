import { z } from 'zod';

// For POST/DELETE routes without input: a body is a 400, not parsed and
// ignored. Fastify sets the body to null when none was sent.
export const NoBody = z.null('the request body must be empty').optional();
