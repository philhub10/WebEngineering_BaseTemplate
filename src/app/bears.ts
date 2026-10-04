// A bear object
export interface Bear {
  name: string;
  binomial: string;
  range: string;
  image: string;
}

interface BearRow {
  name: string;
  binomial: string;
  fileName: string;
  range: string;
}

// These describe the parts of the Wikipedia JSON responses that we read.
// The fields are optional because we can't be sure the API actually sends
// them - we still have to check for that with `if` before using them.
interface WikipediaParseResult {
  parse?: {
    wikitext?: {
      '*': string;
    };
  };
  error?: {
    info?: string;
  };
}

interface WikipediaImageInfoResult {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: Array<{ url: string }>;
      }
    >;
  };
}

const baseUrl = 'https://en.wikipedia.org/w/api.php';
const pageTitle = 'List_of_ursids';

const PLACEHOLDER_IMAGE = 'media/placeholder-image.jpg';

// `fetch` and `.json()` can't tell us the shape of the data at compile time,
// so this just returns `unknown` - the caller has to check it before use.
async function fetchJson(
  url: string,
  context: string,
  signal?: AbortSignal
): Promise<unknown> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`${context} responded with status ${res.status}`);
  }
  return await res.json();
}

// A URL returned by the Wikipedia API is not a guarantee that it is reachable or a valid image.
const verifyImageLoads = async (url: string): Promise<string> => {
  // Image.onload/onerror is a callback-based browser API; wrapping it in a
  // Promise is the standard way to make it awaitable.
  // eslint-disable-next-line promise/avoid-new -- see comment above
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(url);
    };
    img.onerror = () => {
      resolve(PLACEHOLDER_IMAGE);
    };
    img.src = url;
  });
};

async function fetchImageUrl(
  fileName: string,
  signal?: AbortSignal
): Promise<string> {
  const imageParams = {
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  };

  const url = `${baseUrl}?${new URLSearchParams(imageParams).toString()}`;

  try {
    const rawData = await fetchJson(url, 'Wikipedia image API', signal);
    // The cast itself proves nothing - `data.query?.pages` etc. below are
    // still read defensively, since every field on WikipediaImageInfoResult
    // is optional and might not actually be there.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
    const data = rawData as WikipediaImageInfoResult;

    const pages = data.query?.pages;
    const [page] = pages === undefined ? [] : Object.values(pages);
    const [imageInfo] = page?.imageinfo ?? [];
    const imageUrl = imageInfo?.url;

    if (imageUrl === undefined) {
      return PLACEHOLDER_IMAGE;
    }

    return await verifyImageLoads(imageUrl);
  } catch (error) {
    // The user only sees a generic error message, so log the real cause
    // here for debugging.
    // eslint-disable-next-line no-console -- see comment above
    console.error(`Could not load image for "${fileName}":`, error);
    return PLACEHOLDER_IMAGE;
  }
}

function matchGroup(regex: RegExp, input: string): string | undefined {
  const match = regex.exec(input);
  const [value] = Object.values(match?.groups ?? {});
  return value;
}

function parseBearRow(row: string): BearRow | null {
  const name = matchGroup(/\|name=\[\[(?<name>.*?)\]\]/v, row);
  const binomial = matchGroup(/\|binomial=(?<binomial>.*?)\n/v, row);
  const image = matchGroup(/\|image=(?<image>.*?)\n/v, row);
  const rawRange = matchGroup(/\|range=(?<range>.*?)\s*\|/v, row);

  if (name === undefined || binomial === undefined || image === undefined) {
    return null;
  }

  return {
    name,
    binomial,
    fileName: image.trim().replace('File:', ''),
    range:
      rawRange === undefined
        ? 'Unknown'
        : rawRange.replace(/\s*\([^\)]*\)/gv, '').trim(),
  };
}

// Parses the wikitext and resolves every bear's image, but does not touch the DOM.
async function getBears(
  wikitext: string,
  signal?: AbortSignal
): Promise<Bear[]> {
  const speciesTables = wikitext.split('{{Species table/end}}');
  const bearRows = speciesTables
    .flatMap((table) => table.split('{{Species table/row'))
    .map(parseBearRow)
    .filter((row) => row !== null);

  // Each bear's image lookup is independent of the others, so they run concurrently.
  const bears = await Promise.all(
    bearRows.map(async (row) => ({
      name: row.name,
      binomial: row.binomial,
      range: row.range,
      image: await fetchImageUrl(row.fileName, signal),
    }))
  );

  const seenNames = new Set<string>();
  return bears.filter((bear) => {
    if (seenNames.has(bear.name)) return false;
    seenNames.add(bear.name);
    return true;
  });
}

// Fetches and parses the bear data. Callers decide how to represent the
// result (and any error) in the UI - this module never touches the DOM, so
// its result can be rendered declaratively from component state. Pass an
// AbortSignal so a caller that no longer needs the result (a newer request
// superseded it, or the component was destroyed) can cancel the underlying
// network requests instead of letting them finish uselessly in the background.
export async function loadBears(signal?: AbortSignal): Promise<Bear[]> {
  const params = {
    action: 'parse',
    page: pageTitle,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
  };

  const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;
  const rawData = await fetchJson(url, 'Wikipedia API', signal);
  // Same reasoning as in fetchImageUrl: this promise is checked field by
  // field below before any of it is trusted.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
  const data = rawData as WikipediaParseResult;

  const { error } = data;
  if (error !== undefined) {
    const { info } = error;
    throw new Error(
      info !== undefined && info !== ''
        ? info
        : 'Wikipedia API returned an error'
    );
  }
  if (data.parse?.wikitext === undefined) {
    throw new Error('Unexpected response shape from Wikipedia API');
  }

  return await getBears(data.parse.wikitext['*'], signal);
}
