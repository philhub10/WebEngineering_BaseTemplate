import { describe, expect, it } from 'vitest';
import { can } from '../src/auth/policy.js';
import type { Action, Actor } from '../src/auth/policy.js';

const lena: Actor = { id: 'lena', role: 'user' };
const max: Actor = { id: 'max', role: 'user' };
const mod: Actor = { id: 'mod', role: 'moderator' };
const lenasComment = { authorId: 'lena' };
const legacyComment = { authorId: null };

// The whole matrix without HTTP: four actors times three actions.
describe('policy', () => {
  it.each<[string, Action, string, Actor | null]>([
    ['anonymous', 'comment:create', 'unauthenticated', null],
    ['anonymous', 'comment:report', 'unauthenticated', null],
    ['anonymous', 'comment:delete', 'unauthenticated', null],
    ['author', 'comment:create', 'allow', lena],
    ['author', 'comment:report', 'allow', lena],
    ['author', 'comment:delete', 'allow', lena],
    ['other user', 'comment:create', 'allow', max],
    ['other user', 'comment:report', 'allow', max],
    ['other user', 'comment:delete', 'forbidden', max],
    ['moderator', 'comment:create', 'allow', mod],
    ['moderator', 'comment:report', 'allow', mod],
    ['moderator', 'comment:delete', 'allow', mod],
  ])('%s, %s -> %s', (_name, action, verdict, actor) => {
    expect(can(actor, action, lenasComment)).toBe(verdict);
  });

  it('forbids deleting without a subject (deny by default)', () => {
    expect(can(lena, 'comment:delete')).toBe('forbidden');
  });

  it('lets only moderators delete comments without an author', () => {
    expect(can(lena, 'comment:delete', legacyComment)).toBe('forbidden');
    expect(can(mod, 'comment:delete', legacyComment)).toBe('allow');
  });
});
