import { z } from 'zod';

// e.g. "ursus-arctos": lowercase words joined by hyphens
export const BearId = z
  .string()
  .regex(/^[a-z]+(?:-[a-z]+)*$/v, 'must be lowercase words joined by hyphens');

export const Bear = z.object({
  id: BearId,
  name: z.string().nonempty(), // e.g. "Brown bear"
  binomial: z.string().nonempty(), // e.g. "Ursus arctos"
  imageUrl: z.url().nullable(), // null if Wikipedia has no image
  range: z.string().nonempty(),
});

export type Bear = z.infer<typeof Bear>;

const MAX_QUERY_LENGTH = 50;

export const BearsQuery = z.object({
  q: z.string().trim().max(MAX_QUERY_LENGTH).optional(),
});
