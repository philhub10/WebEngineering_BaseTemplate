import { z } from 'zod';

// RFC 9457 Problem Details, the body of every 4xx and 5xx response.
// Registered with an id so the OpenAPI document lists it once as
// components.schemas.Problem and references it from every route.
export const Problem = z
  .object({
    type: z.string().describe('URI of the problem kind; clients branch on it'),
    title: z.string().describe('Short summary, stable per type'),
    status: z.number().int().describe('The HTTP status code'),
    detail: z.string().describe('This occurrence, for humans'),
    instance: z.string().describe('This occurrence: urn:uuid:<request id>'),
    errors: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional()
      .describe('Validation errors, one per invalid field'),
  })
  .meta({ id: 'Problem' });

export type Problem = z.infer<typeof Problem>;

// Spread into a route's `response` schema.
export const problemResponses = { '4xx': Problem, '5xx': Problem };
