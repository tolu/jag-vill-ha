import { defineHandler } from 'void';
import { storage } from 'void/storage';
import { IMAGE_KEY } from '../../src/images';

export const GET = defineHandler(async (c) => {
  const key = c.req.path.replace(/^\/bild\//, '');
  if (!IMAGE_KEY.test(key)) return c.notFound();
  const object = await storage.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  // Uploaded files must never run as a page on this origin.
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', 'attachment');
  // Keys are unique per upload, so a stored image never changes.
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
});
