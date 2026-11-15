// Reading a product page's name and picture from its HTML. Pure functions:
// the network part lives in link-fetch.ts.

/**
 * Whether a link is safe for the server to request. Refuses anything that is
 * not a public web address, so the fetcher cannot be pointed at internal hosts.
 */
export function isFetchableUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  if (url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  if (!host.includes('.') || host.endsWith('.')) return false;
  if (/^[\d.]+$/.test(host) || host.startsWith('[')) return false; // IP literals
  return !/(^|\.)(localhost|local|internal|lan|home|test|invalid|example)$/.test(host);
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match;
    const point = code[1]!.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
  });
}

const clean = (text: string | undefined) => (text ? decodeEntities(text).replace(/\s+/g, ' ').trim() : '');

/** Every <meta> content on the page, grouped by its property or name, in page order. */
function metaTags(html: string) {
  const found = new Map<string, string[]>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    const value = clean(content?.[1] ?? content?.[2]);
    if (key && value) found.set(key, [...(found.get(key) ?? []), value]);
  }
  return found;
}

// Shops often list their own logo as the first image and the product second.
const looksLikeLogo = (url: string) => /logo|favicon|icon|sprite|placeholder/i.test(url);

/** Title and image of a page, from Open Graph, Twitter cards or the <title>. */
export function parseLinkMeta(html: string, pageUrl: string) {
  const meta = metaTags(html);
  const first = (keys: string[]) => keys.flatMap((key) => meta.get(key) ?? [])[0] ?? '';

  const title = first(['og:title', 'twitter:title']) || clean(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]);

  const candidates = ['og:image:secure_url', 'og:image', 'twitter:image'].flatMap((key) => meta.get(key) ?? []);
  const imagePath = candidates.find((url) => !looksLikeLogo(url)) ?? candidates[0] ?? '';

  let image: string | null = null;
  try {
    const resolved = imagePath ? new URL(imagePath, pageUrl).href : null;
    image = resolved && isFetchableUrl(resolved) ? resolved : null;
  } catch {
    image = null;
  }

  return { title: title ? title.slice(0, 120) : null, image };
}
