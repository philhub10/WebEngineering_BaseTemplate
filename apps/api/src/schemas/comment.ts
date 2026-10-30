import { z } from 'zod';
import { BearId } from './bear.js';

const MAX_AUTHOR_LENGTH = 80;
const MAX_TEXT_LENGTH = 2000;

// The messages end up in the problem's `detail`, e.g. "text must not be empty".
export const NewComment = z.object({
  author: z
    .string('must be a string')
    .trim()
    .nonempty('must not be empty')
    .max(MAX_AUTHOR_LENGTH, `must be at most ${MAX_AUTHOR_LENGTH} characters`),
  text: z
    .string('must be a string')
    .trim()
    .nonempty('must not be empty')
    .max(MAX_TEXT_LENGTH, `must be at most ${MAX_TEXT_LENGTH} characters`),
});

export type NewComment = z.infer<typeof NewComment>;

export const Comment = NewComment.extend({
  id: z.uuid(),
  bearId: BearId,
  createdAt: z.iso.datetime(),
});

export type Comment = z.infer<typeof Comment>;
