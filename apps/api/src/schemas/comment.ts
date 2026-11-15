import { z } from 'zod';
import { BearId } from './bear.js';

const MAX_AUTHOR_LENGTH = 80;
const MAX_TEXT_LENGTH = 2000;
const MIN_PAGE_SIZE = 1;
const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 20;
const MAX_CURSOR_LENGTH = 500;

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
  reportCount: z.number().int(),
  hiddenAt: z.iso.datetime().nullable(),
});

export type Comment = z.infer<typeof Comment>;

export const CommentsQuery = z.object({
  limit: z.coerce
    .number('must be a number')
    .int('must be an integer')
    .min(MIN_PAGE_SIZE, `must be at least ${MIN_PAGE_SIZE}`)
    .max(MAX_PAGE_SIZE, `must be at most ${MAX_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  cursor: z.string().max(MAX_CURSOR_LENGTH).optional(),
});

export type CommentsQuery = z.infer<typeof CommentsQuery>;

export const CommentPage = z.object({
  items: z.array(Comment),
  nextCursor: z.string().nullable(),
});

export type CommentPage = z.infer<typeof CommentPage>;

export const CommentCursor = z.object({
  createdAt: z.iso.datetime(),
  id: z.uuid(),
});

export type CommentCursor = z.infer<typeof CommentCursor>;
