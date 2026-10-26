import { z } from 'zod';

export const Bear = z.object({
  id: z.string().nonempty(), // e.g. "ursus-arctos"
  name: z.string().nonempty(), // e.g. "Brown bear"
  binomial: z.string().nonempty(), // e.g. "Ursus arctos"
  imageUrl: z.url().nullable(), // null if Wikipedia has no image
  range: z.string().nonempty(),
});

export type Bear = z.infer<typeof Bear>;
