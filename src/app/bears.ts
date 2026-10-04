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
async function fetchJson(url: string, context: string): Promise<unknown> {
  const res = await fetch(url);
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

async function fetchImageUrl(fileName: string): Promise<string> {
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
    const rawData = await fetchJson(url, 'Wikipedia image API');
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
async function getBears(wikitext: string): Promise<Bear[]> {
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
      image: await fetchImageUrl(row.fileName),
    }))
  );

  const seenNames = new Set<string>();
  return bears.filter((bear) => {
    if (seenNames.has(bear.name)) return false;
    seenNames.add(bear.name);
    return true;
  });
}

// Only touches the DOM, given already-resolved bear data.
function renderBears(bears: Bear[]): void {
  const moreBears = document.querySelector<HTMLElement>('.more_bears');
  if (moreBears === null) {
    throw new Error('".more_bears" element not found');
  }
  const bearsHtml = bears
    .map(
      (bear) =>
        `<div class="bear">` +
        `<img src="${bear.image}" alt="Image of ${bear.name}" style="width:200px; height:auto;">` +
        `<p><b>${bear.name}</b> (${bear.binomial})</p>` +
        `<p>Range: ${bear.range}</p>` +
        `</div>`
    )
    .join('');

  // Inserted once as a single fragment instead of repeated innerHTML += in a loop,
  // so already-rendered content (e.g. the "More Bears" heading) isn't re-parsed every iteration.
  moreBears.insertAdjacentHTML('beforeend', bearsHtml);
}

function showBearsError(message: string): void {
  const moreBears = document.querySelector<HTMLElement>('.more_bears');
  if (moreBears === null) {
    throw new Error('".more_bears" element not found');
  }
  const errorPara = document.createElement('p');
  errorPara.className = 'error-message';
  errorPara.textContent = message;
  moreBears.appendChild(errorPara);
}

export async function loadBears(): Promise<void> {
  const params = {
    action: 'parse',
    page: pageTitle,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
  };

  try {
    const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;
    const rawData = await fetchJson(url, 'Wikipedia API');
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

    const bears = await getBears(data.parse.wikitext['*']);
    renderBears(bears);
  } catch (error) {
    // The user only sees a generic error message, so log the real cause
    // here for debugging.
    // eslint-disable-next-line no-console -- see comment above
    console.error('Failed to load bear data:', error);
    showBearsError(
      'Sorry, the bear data could not be loaded right now. Please try again later.'
    );
  }
}
