import { NotFoundError } from '../errors.js';
import type { BearRepository } from '../repositories/bear-repository.js';
import type { Bear } from '../schemas/bear.js';

export async function loadBears(
  bears: BearRepository,
  q?: string
): Promise<Bear[]> {
  return await bears.list(q === '' ? undefined : q);
}

export async function loadBear(
  bears: BearRepository,
  id: string
): Promise<Bear> {
  const bear = await bears.findById(id);
  if (bear === null) {
    throw new NotFoundError(`No bear with id "${id}"`);
  }
  return bear;
}
