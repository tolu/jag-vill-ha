import { isWishIcon } from './icons';

type FormBody = Record<string, unknown>;

const text = (body: FormBody, key: string) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '');

function parseUrl(input: string) {
  if (input === '') return null;
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Turns a submitted wish form into values for the database. Browser validation
 * catches most mistakes first; this is the check that cannot be skipped.
 */
export function parseWishForm(body: FormBody) {
  const title = text(body, 'titel');
  const url = parseUrl(text(body, 'lank'));
  const note = text(body, 'kommentar');
  const icon = text(body, 'ikon');

  const problems: string[] = [];
  if (title === '' || title.length > 120) problems.push('titel');
  if (url === undefined) problems.push('lank');
  if (note.length > 200) problems.push('kommentar');
  if (icon !== '' && !isWishIcon(icon)) problems.push('ikon');

  if (problems.length > 0 || url === undefined) return { ok: false, problems } as const;

  return {
    ok: true,
    values: { title, url, note: note === '' ? null : note, icon: icon === '' ? null : icon },
  } as const;
}

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Decides what an uploaded image field means. An empty file input is "none";
 * SVG is refused on purpose because it can carry scripts.
 */
export function checkImage(file: unknown) {
  if (!file || typeof file !== 'object' || !('size' in file) || !('type' in file)) return { kind: 'none' } as const;
  const { size, type } = file as { size: number; type: string };
  if (size === 0) return { kind: 'none' } as const;
  const extension = IMAGE_TYPES[type];
  if (!extension) return { kind: 'bad', problem: 'type' } as const;
  if (size > MAX_IMAGE_BYTES) return { kind: 'bad', problem: 'size' } as const;
  return { kind: 'image', extension, contentType: type } as const;
}
