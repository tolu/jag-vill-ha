import { defineHandler, defineHead, type InferProps } from 'void';
import { getAuth } from 'void/auth';
import { parseRecoveryEmail } from '../src/recovery-email';

export type Props = InferProps<typeof loader>;

export const prerender = false;

// `fel` is where a link that is too old or already used ends up.
export const loader = defineHandler((c) => ({ sent: c.req.query('skickat') === '1', expired: c.req.query('fel') === '1' }));

export const action = defineHandler(async (c) => {
  const body = await c.req.parseBody();
  const email = parseRecoveryEmail(String(body['epost'] ?? ''));
  // Same answer whether or not the address exists, so accounts cannot be probed.
  if (email) {
    await getAuth(c)
      .api.signInMagicLink({ body: { email, callbackURL: '/konto?aterstalld=1', errorCallbackURL: '/aterstall?fel=1' }, headers: c.req.raw.headers })
      .catch(() => undefined);
  }
  return c.redirect('/aterstall?skickat=1', 303);
});

export const head = defineHead(() => ({ title: 'Kommer du inte in? – Jag vill ha' }));
