import { z } from 'zod';
import { NotFoundError, UpstreamError } from '../errors.js';
import { Bear } from '../schemas/bear.js';
import type { Env } from '../schemas/env.js';
import { fetchImageUrls, fetchUrsidsWikitext } from './wikipedia.js';

interface BearRow {
  name: string;
  binomial: string;
  fileName: string;
  range: string;
}

function matchGroup(regex: RegExp, input: string): string | undefined {
  const [value] = Object.values(regex.exec(input)?.groups ?? {});
  return value;
}

// "Ursus arctos" -> "ursus-arctos"
function slugify(text: string): string {
  return text.toLowerCase().replaceAll(' ', '-');
}

// Parses one "{{Species table/row ...}}" block.
function parseBearRow(row: string, genus: string): BearRow | null {
  const name = matchGroup(/\|name=\[\[(?<name>.*?)\]\]/v, row);
  const binomial = matchGroup(/\|binomial=(?<binomial>.*?)\n/v, row);
  const fileName = matchGroup(/\|image=File:(?<file>.*?)\s*\|/v, row);
  const range = matchGroup(/\|range=(?<range>.*?)\s*\|/v, row);

  // The page abbreviates the genus: "U. arctos" -> species "arctos"
  const [, species] = binomial?.split(' ') ?? [];

  if (name === undefined || species === undefined || fileName === undefined) {
    return null;
  }

  return {
    name,
    binomial: `${genus} ${species}`, // "Ursus arctos"
    fileName,
    range: range?.replace(/\s*\(.*?\)/gv, '') ?? 'Unknown',
  };
}

function parseBearRows(wikitext: string): BearRow[] {
  const rows: BearRow[] = [];

  for (const table of wikitext.split('{{Species table/end}}')) {
    // "[[Ursus (genus)|Ursus]]" -> "Ursus"
    const genusLink = matchGroup(/\|genus=\[\[(?<genus>.*?)\]\]/v, table);
    const genus = genusLink?.split('|').pop();
    if (genus === undefined) {
      continue;
    }

    // Everything before the first row is the table header, so skip it.
    const [, ...tableRows] = table.split('{{Species table/row');

    for (const tableRow of tableRows) {
      const row = parseBearRow(tableRow, genus);
      if (row !== null) {
        rows.push(row);
      }
    }
  }

  return rows;
}

// Fetches the bears from Wikipedia.
export async function loadBears(config: Env): Promise<Bear[]> {
  const wikitext = await fetchUrsidsWikitext(config);
  const rows = parseBearRows(wikitext);
  const [firstRow] = rows;
  if (firstRow === undefined) {
    throw new UpstreamError('No bears found on the Wikipedia page');
  }

  const imageUrls = await fetchImageUrls(
    rows.map((row) => row.fileName),
    config
  );

  const bears = rows.map((row) => ({
    id: slugify(row.binomial),
    name: row.name,
    binomial: row.binomial,
    imageUrl: imageUrls.get(row.fileName) ?? null,
    range: row.range,
  }));

  const result = z.array(Bear).safeParse(bears);
  if (!result.success) {
    throw new UpstreamError('Wikipedia data did not match the Bear schema', {
      cause: result.error,
    });
  }
  return result.data;
}

// Returns one bear, or throws a NotFoundError (404) if the id is unknown.
export async function loadBear(config: Env, id: string): Promise<Bear> {
  const bears = await loadBears(config);
  const bear = bears.find((candidate) => candidate.id === id);
  if (bear === undefined) {
    throw new NotFoundError(`No bear with id "${id}"`);
  }
  return bear;
}
