import { storage } from 'void/storage';
import { STORED_KEY } from './cleanup';
import { checkImage } from './wish-form';

/** Keys are chosen here, never taken from the upload, so they are safe to serve. */
export const IMAGE_KEY = STORED_KEY;

/**
 * Stores the uploaded image, if there is one: a wish's picture ("w") or the
 * owner's profile picture ("a"). Returns the new key, null when
 * no file was sent, or 'bad' when the file is not an acceptable image.
 */
export async function saveImage(listId: number, file: unknown, kind: 'w' | 'a' = 'w') {
  const check = checkImage(file);
  if (check.kind === 'none') return null;
  if (check.kind === 'bad') return 'bad' as const;
  const key = `${kind}/${listId}/${crypto.randomUUID()}.${check.extension}`;
  await storage.put(key, file as File, { httpMetadata: { contentType: check.contentType } });
  return key;
}

export async function deleteImage(key: string | null) {
  if (key) await storage.delete(key);
}
