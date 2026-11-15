import { defineHandler } from 'void';
import { requireAuth } from 'void/auth';
import { fetchLinkMeta } from '../../src/link-fetch';

// Used by "Lägg till från länk". Signed-in owners only, so it cannot be used
// as an open proxy for fetching other sites.
export const POST = defineHandler(async (c) => {
  requireAuth(c);
  const body = await c.req.parseBody();
  const url = typeof body['lank'] === 'string' ? body['lank'].trim() : '';
  return c.json(await fetchLinkMeta(url));
});
