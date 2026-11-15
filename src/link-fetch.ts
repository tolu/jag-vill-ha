import { isFetchableUrl, parseLinkMeta } from './link-meta';
import { checkImage } from './wish-form';

const TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 400_000; // metadata sits in <head>; no need for the whole page
const MAX_IMAGE_BYTES = 5_000_000; // downscaled in the browser before it is stored

// Presents itself as an ordinary browser. Tested against a large Nordic shop:
// its bot filter drops the connection for every other identity we tried,
// including an honest "link preview" one, and answers this one normally.
// One request per link an owner pastes; no crawling.
const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,image/*;q=0.9,*/*;q=0.5',
  'accept-language': 'sv,nb;q=0.9,en;q=0.8',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
};

async function get(url: string) {
  if (!isFetchableUrl(url)) return null;
  const response = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
  // A redirect must not lead somewhere the first check would have refused.
  return response.ok && isFetchableUrl(response.url) ? response : null;
}

/** Reads at most `limit` bytes; null when the body is larger. */
async function readLimited(response: Response, limit: number, truncate: boolean) {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      if (!truncate) return null;
      chunks.push(value.subarray(0, value.byteLength - (size - limit)));
      break;
    }
    chunks.push(value);
  }
  return new Blob(chunks as BlobPart[]);
}

const nothing = (reason: 'blocked' | 'unreachable' | 'empty') => ({ title: null, image: null, reason });

/**
 * Name and picture for a pasted link. Never throws: shops block, time out and
 * serve nonsense. `reason` says which, so the owner gets a useful message and
 * the log shows how often each happens.
 */
export async function fetchLinkMeta(url: string) {
  if (!isFetchableUrl(url)) return nothing('unreachable');
  const host = new URL(url).hostname;
  try {
    const response = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok || !isFetchableUrl(response.url)) {
      console.warn(`Link fetch blocked: ${host} answered ${response.status}`);
      return nothing('blocked');
    }
    if (!(response.headers.get('content-type') ?? '').includes('html')) return nothing('empty');
    const body = await readLimited(response, MAX_HTML_BYTES, true);
    const meta = body ? parseLinkMeta(await body.text(), response.url) : { title: null, image: null };
    if (!meta.title && !meta.image) {
      console.warn(`Link fetch empty: ${host} had no usable metadata`);
      return nothing('empty');
    }
    return { ...meta, reason: null };
  } catch (error) {
    const name = error instanceof Error ? error.name : 'error';
    console.warn(`Link fetch failed: ${host}: ${name}`);
    // A shop that never answers is, to the owner, the same as one that says no.
    return nothing(name === 'TimeoutError' ? 'blocked' : 'unreachable');
  }
}

/**
 * Fetches a picture found on a linked page so the browser can downscale it
 * like any other chosen image. Null when it is missing, too large or not an image.
 */
export async function fetchRemoteImage(url: string) {
  try {
    const response = await get(url);
    if (!response) return null;
    const type = (response.headers.get('content-type') ?? '').split(';')[0]!.trim();
    const body = await readLimited(response, MAX_IMAGE_BYTES, false);
    if (!body || checkImage({ size: body.size, type }).kind !== 'image') return null;
    return { body, type };
  } catch {
    return null;
  }
}
