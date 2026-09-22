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
    pages?: {
      [pageId: string]: {
        imageinfo?: { url: string }[];
      };
    };
  };
}

const baseUrl = 'https://en.wikipedia.org/w/api.php';
const pageTitle = 'List_of_ursids';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
      '<rect width="100%" height="100%" fill="#ddd"/>' +
      '<text x="50%" y="50%" font-family="Arial" font-size="14" fill="#666" text-anchor="middle" dominant-baseline="middle">No image available</text>' +
      '</svg>'
  );

// `fetch` and `.json()` can't tell us the shape of the data at compile time,
// so this just returns `unknown` - the caller has to check it before use.
async function fetchJson(url: string, context: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(context + ' responded with status ' + res.status);
  }
  return res.json();
}

// A URL returned by the Wikipedia API is not a guarantee that it is reachable or a valid image.
const verifyImageLoads = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(PLACEHOLDER_IMAGE);
    img.src = url;
  });
};

async function fetchImageUrl(fileName: string): Promise<string> {
  const imageParams = {
    action: 'query',
    titles: 'File:' + fileName,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  };

  const url = baseUrl + '?' + new URLSearchParams(imageParams).toString();

  try {
    const rawData = await fetchJson(url, 'Wikipedia image API');
    const data = rawData as WikipediaImageInfoResult;

    const pages = data.query?.pages;
    const page = pages ? Object.values(pages)[0] : undefined;
    const imageUrl = page?.imageinfo?.[0]?.url;

    if (!imageUrl) {
      return PLACEHOLDER_IMAGE;
    }

    return await verifyImageLoads(imageUrl);
  } catch (error) {
    console.error('Could not load image for "' + fileName + '":', error);
    return PLACEHOLDER_IMAGE;
  }
}

function parseBearRow(row: string): BearRow | null {
  const nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
  const binomialMatch = row.match(/\|binomial=(.*?)\n/);
  const imageMatch = row.match(/\|image=(.*?)\n/);
  const rangeMatch = row.match(/\|range=(.*?)\s*\|/);

  if (!nameMatch || !binomialMatch || !imageMatch) {
    return null;
  }

  return {
    name: nameMatch[1],
    binomial: binomialMatch[1],
    fileName: imageMatch[1].trim().replace('File:', ''),
    range: rangeMatch ? rangeMatch[1].replace(/\s*\([^)]*\)/g, '').trim() : 'Unknown',
  };
}

// Parses the wikitext and resolves every bear's image, but does not touch the DOM.
async function getBears(wikitext: string): Promise<Bear[]> {
  const speciesTables = wikitext.split('{{Species table/end}}');
  const bearRows = speciesTables
    .flatMap((table) => table.split('{{Species table/row'))
    .map(parseBearRow)
    .filter((row) => row !== null) as BearRow[];

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
  if (!moreBears) {
    throw new Error('".more_bears" element not found');
  }
  const bearsHtml = bears
    .map(
      (bear) =>
        '<div class="bear">' +
        '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
        '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
        '<p>Range: ' + bear.range + '</p>' +
        '</div>'
    )
    .join('');

  // Inserted once as a single fragment instead of repeated innerHTML += in a loop,
  // so already-rendered content (e.g. the "More Bears" heading) isn't re-parsed every iteration.
  moreBears.insertAdjacentHTML('beforeend', bearsHtml);
}

function showBearsError(message: string): void {
  const moreBears = document.querySelector<HTMLElement>('.more_bears');
  if (!moreBears) {
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
    const url = baseUrl + '?' + new URLSearchParams(params).toString();
    const rawData = await fetchJson(url, 'Wikipedia API');
    const data = rawData as WikipediaParseResult;

    if (data.error) {
      throw new Error(data.error.info || 'Wikipedia API returned an error');
    }
    if (!data.parse || !data.parse.wikitext) {
      throw new Error('Unexpected response shape from Wikipedia API');
    }

    const bears = await getBears(data.parse.wikitext['*']);
    renderBears(bears);
  } catch (error) {
    console.error('Failed to load bear data:', error);
    showBearsError('Sorry, the bear data could not be loaded right now. Please try again later.');
  }
}
