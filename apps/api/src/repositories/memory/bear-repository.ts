import type { Bear } from '../../schemas/bear.js';
import type { BearRepository } from '../bear-repository.js';

export class MemoryBearRepository implements BearRepository {
  private bears: Map<string, Bear>;

  constructor(initial: Bear[] = []) {
    this.bears = new Map(initial.map((bear) => [bear.id, bear]));
  }

  async list(nameFilter?: string): Promise<Bear[]> {
    const needle = nameFilter?.toLowerCase() ?? '';
    return await Promise.resolve(
      [...this.bears.values()].filter((bear) =>
        bear.name.toLowerCase().includes(needle)
      )
    );
  }

  async findById(id: string): Promise<Bear | null> {
    return await Promise.resolve(this.bears.get(id) ?? null);
  }

  async upsertMany(input: Bear[]): Promise<void> {
    const next = new Map(input.map((bear) => [bear.id, bear]));
    for (const [id, bear] of this.bears) {
      if (!next.has(id)) {
        next.set(id, bear);
      }
    }
    this.bears = next;
    await Promise.resolve();
  }
}
