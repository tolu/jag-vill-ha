import { storage } from 'void/storage';
import { checkImage } from './wish-form';

/** Keys are chosen here, never taken from the upload, so they are safe to serve. */
export const IMAGE_KEY = /^w\/\d+\/[0-9a-f-]{36}\.(jpg|png|webp|avif|gif)$/;

/**
 * Stores the uploaded image, if there is one. Returns the new key, null when
 * no file was sent, or 'bad' when the file is not an acceptable image.
 */
export async function saveImage(listId: number, file: unknown) {
  const check = checkImage(file);
  if (check.kind === 'none') return null;
  if (check.kind === 'bad') return 'bad' as const;
  const key = `w/${listId}/${crypto.randomUUID()}.${check.extension}`;
  await storage.put(key, file as File, { httpMetadata: { contentType: check.contentType } });
  return key;
}

export async function deleteImage(key: string | null) {
  if (key) await storage.delete(key);
}
