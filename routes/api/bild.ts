import { defineHandler } from 'void';
import { requireAuth } from 'void/auth';
import { fetchRemoteImage } from '../../src/link-fetch';

// Passes a picture from a linked page to the owner's browser, where it is
// downscaled before upload. Signed-in owners only, and only real image types.
export const POST = defineHandler(async (c) => {
  requireAuth(c);
  const body = await c.req.parseBody();
  const picture = await fetchRemoteImage(typeof body['bild'] === 'string' ? body['bild'] : '');
  if (!picture) return c.notFound();
  return new Response(picture.body, {
    headers: { 'content-type': picture.type, 'x-content-type-options': 'nosniff', 'cache-control': 'no-store' },
  });
});
