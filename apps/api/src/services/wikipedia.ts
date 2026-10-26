import { z } from 'zod';
import { UpstreamError, UpstreamTimeoutError } from '../errors.js';
import type { Env } from '../schemas/env.js';

const TIMEOUT_MS = 5000;

const ParseResponse = z.object({
  parse: z.object({ wikitext: z.string() }),
});

const ImageInfoResponse = z.object({
  query: z.object({
    pages: z.array(
      z.object({
        title: z.string(),
        imageinfo: z.array(z.object({ url: z.url() })).optional(),
      })
    ),
  }),
});

async function sendRequest(url: URL, config: Env): Promise<Response> {
  try {
    return await fetch(url, {
      headers: { 'User-Agent': config.USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new UpstreamTimeoutError('Wikipedia did not answer in time', {
        cause: err,
      });
    }
    throw new UpstreamError('Wikipedia is unreachable', { cause: err });
  }
}

async function callWikipedia(
  params: Record<string, string>,
  config: Env
): Promise<unknown> {
  const url = new URL('/w/api.php', config.WIKIPEDIA_BASE_URL);
  url.search = new URLSearchParams({
    ...params,
    format: 'json',
    formatversion: '2',
  }).toString();

  const response = await sendRequest(url, config);

  if (!response.ok) {
    throw new UpstreamError(`Wikipedia answered with ${response.status}`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new UpstreamError('Wikipedia sent invalid JSON', { cause: err });
  }
}

// Returns the wikitext of the "Ursids" section of the "List of ursids" page.
export async function fetchUrsidsWikitext(config: Env): Promise<string> {
  const data = await callWikipedia(
    {
      action: 'parse',
      page: 'List_of_ursids',
      prop: 'wikitext',
      section: '3',
    },
    config
  );

  const result = ParseResponse.safeParse(data);
  if (!result.success) {
    throw new UpstreamError('Wikipedia sent an unexpected page', {
      cause: result.error,
    });
  }
  return result.data.parse.wikitext;
}

// Looks up the image URLs of several files in one request.
// Returns a Map from file name (e.g. "Grosser Panda.JPG") to its URL.
export async function fetchImageUrls(
  fileNames: string[],
  config: Env
): Promise<Map<string, string>> {
  const data = await callWikipedia(
    {
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url',
      titles: fileNames.map((fileName) => `File:${fileName}`).join('|'),
    },
    config
  );

  const result = ImageInfoResponse.safeParse(data);
  if (!result.success) {
    throw new UpstreamError('Wikipedia sent unexpected image data', {
      cause: result.error,
    });
  }

  const imageUrls = new Map<string, string>();
  for (const page of result.data.query.pages) {
    const [info] = page.imageinfo ?? [];
    if (info !== undefined) {
      imageUrls.set(page.title.replace('File:', ''), info.url);
    }
  }
  return imageUrls;
}
