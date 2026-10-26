import { z } from 'zod';
import { BearId } from './bear.js';

const MAX_AUTHOR_LENGTH = 80;
const MAX_TEXT_LENGTH = 2000;

export const NewComment = z.object({
  author: z.string().trim().nonempty().max(MAX_AUTHOR_LENGTH),
  text: z.string().trim().nonempty().max(MAX_TEXT_LENGTH),
});

export type NewComment = z.infer<typeof NewComment>;

export const Comment = NewComment.extend({
  id: z.uuid(),
  bearId: BearId,
  createdAt: z.iso.datetime(),
});

export type Comment = z.infer<typeof Comment>;
