import { apiUrl } from './api';
import { toApiError } from './problem';

export interface Bear {
  id: string;
  name: string;
  binomial: string;
  range: string;
  image: string;
}

interface BearResponse {
  id: string;
  name: string;
  binomial: string;
  range: string;
  imageUrl: string | null;
}

const PLACEHOLDER_IMAGE = 'media/placeholder-image.jpg';
const NOT_FOUND = 404;

function toBear(bear: BearResponse): Bear {
  return {
    id: bear.id,
    name: bear.name,
    binomial: bear.binomial,
    range: bear.range,
    image: bear.imageUrl ?? PLACEHOLDER_IMAGE,
  };
}

// Pass an AbortSignal so a caller that no longer needs the result (the
// component was destroyed) can cancel the request.
export async function loadBears(signal?: AbortSignal): Promise<Bear[]> {
  const res = await fetch(apiUrl('/api/bears'), { signal });
  if (!res.ok) {
    throw await toApiError(res);
  }
  // Our own API validated the data with zod before sending it.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
  const bears = (await res.json()) as BearResponse[];
  return bears.map(toBear);
}

// Returns null if there is no bear with this id.
export async function loadBear(
  id: string,
  signal?: AbortSignal
): Promise<Bear | null> {
  const res = await fetch(apiUrl(`/api/bears/${encodeURIComponent(id)}`), {
    signal,
  });
  if (res.status === NOT_FOUND) {
    return null;
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
  // Same reasoning as in loadBears.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
  const bear = (await res.json()) as BearResponse;
  return toBear(bear);
}
