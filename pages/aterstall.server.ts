import { defineHandler, defineHead, type InferProps } from 'void';
import { getAuth } from 'void/auth';
import { parseRecoveryEmail } from '../src/recovery-email';

export type Props = InferProps<typeof loader>;

export const prerender = false;

export const loader = defineHandler((c) => ({ sent: c.req.query('skickat') === '1' }));

export const action = defineHandler(async (c) => {
  const body = await c.req.parseBody();
  const email = parseRecoveryEmail(String(body['epost'] ?? ''));
  // Same answer whether or not the address exists, so accounts cannot be probed.
  if (email) {
    await getAuth(c)
      .api.signInMagicLink({ body: { email, callbackURL: '/konto' }, headers: c.req.raw.headers })
      .catch(() => undefined);
  }
  return c.redirect('/aterstall?skickat=1', 303);
});

export const head = defineHead(() => ({ title: 'Återställ – Jag vill ha' }));
