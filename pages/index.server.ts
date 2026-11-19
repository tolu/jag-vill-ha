import { defineHandler, defineHead, type InferProps } from 'void';
import { getUser } from 'void/auth';

// Looks at the session, so the page cannot be built ahead of time.
export const prerender = false;

export type Props = InferProps<typeof loader>;

// Signed-in owners never see the landing page: "home" is their list.
export const loader = defineHandler((c) => {
  if (getUser()) return c.redirect('/lista');
  return { deleted: c.req.query('borttaget') === '1' };
});

export const head = defineHead(() => ({
  title: 'Jag vill ha – önskelistan utan dubbletter',
  meta: [
    {
      name: 'description',
      content: 'Skriv upp vad du vill ha och skicka länken till släkten. De paxar utan konto.',
    },
  ],
}));
