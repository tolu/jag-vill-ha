import { getCookie, setCookie } from 'hono/cookie';
import { defineHandler, defineHead, type InferProps } from 'void';
import { getUser } from 'void/auth';
import { and, asc, db, eq, inArray } from 'void/db';
import type { RouteUrl } from 'void/routes';
import { lists, reservations, wishes } from '@schema';
import { giverToken, hashToken, newToken, parseGiverName, publicWishes, reserveOutcome, reservationsForViewer } from '../src/reservation';
import { parseTheme } from '../src/theme';
import { checkUsername, normalizeUsername } from '../src/username';
import { countsAsVisit } from '../src/visit';
import { recordVisit } from '../src/visit-store';
import { isNorwegianVisitor, possessive, priceSearchLinks, shopLabel, thumbHue } from '../src/wish';

export type Props = InferProps<typeof loader>;

// The giver's device: a secret token for undoing, and the name for next time.
const TOKEN_COOKIE = 'jvh_givare';
const NAME_COOKIE = 'jvh_namn';
const ONE_YEAR = 60 * 60 * 24 * 365;

async function findList(input: string | undefined) {
  const username = normalizeUsername(input ?? '');
  if (checkUsername(username)) return null;
  const [list] = await db.select().from(lists).where(eq(lists.username, username));
  return list ?? null;
}

export const loader = defineHandler(async (c) => {
  const list = await findList(c.req.param('username'));
  if (!list) return c.notFound();

  const wishRows = await db
    .select()
    .from(wishes)
    .where(eq(wishes.listId, list.id))
    .orderBy(asc(wishes.position), asc(wishes.id));

  const isOwner = getUser()?.id === list.ownerId;
  const visit = {
    isOwner,
    path: `/${list.username}`,
    userAgent: c.req.header('user-agent'),
    purpose: c.req.header('sec-purpose'),
    referer: c.req.header('referer'),
  };
  if (countsAsVisit(visit)) await recordVisit(list.id);
  const reservationRows = await reservationsForViewer(isOwner, async () =>
    wishRows.length
      ? db
          .select()
          .from(reservations)
          .where(inArray(reservations.wishId, wishRows.map((wish) => wish.id)))
      : [],
  );

  const token = getCookie(c, TOKEN_COOKIE);
  // Cloudflare adds the visitor's country to every request it serves.
  const country = (c.req.raw as Request & { cf?: { country?: string } }).cf?.country ?? c.req.header('cf-ipcountry');
  const norwegian = isNorwegianVisitor(country, c.req.header('accept-language'));
  const notice = c.req.query('upptagen') === '1' ? 'taken' : c.req.query('fel') === '1' ? 'name' : c.req.query('borta') === '1' ? 'gone' : null;

  const shown = publicWishes(wishRows, reservationRows, token ? await hashToken(token) : null);
  // What she just did, said back to her. The address alone proves nothing, so
  // it is only said when the list agrees.
  const reserved = shown.find((wish) => wish.id === Number(c.req.query('paxad')) && wish.state === 'mine');
  const released = shown.find((wish) => wish.id === Number(c.req.query('angrad')) && wish.state === 'free');

  return {
    username: list.username,
    displayName: list.displayName,
    avatarKey: list.avatarKey,
    intro: list.intro,
    // On the dev server `?theme=` tries a theme on without saving it.
    theme: (import.meta.env.DEV ? parseTheme(c.req.query('theme')) : null) ?? parseTheme(list.theme),
    isOwner,
    notice: notice as 'taken' | 'name' | 'gone' | null,
    reservedTitle: reserved?.title ?? null,
    releasedTitle: released?.title ?? null,
    giverName: getCookie(c, NAME_COOKIE) ?? '',
    // A first-time giver has no cookie yet: see giverToken.
    formToken: token ? null : newToken(),
    wishes: shown.map((wish) => ({
      ...wish,
      hue: thumbHue(wish.title),
      shop: wish.url ? shopLabel(wish.url) : null,
      priceSearch: priceSearchLinks(wish.title, norwegian),
    })),
  };
});

export const action = defineHandler(async (c) => {
  const list = await findList(c.req.param('username'));
  if (!list) return c.notFound();
  // The username comes from the database row, so these are real routes.
  const back = (query = '') => `/${list.username}${query}` as RouteUrl;

  // The owner cannot reserve on their own list, and learns nothing by trying.
  if (getUser()?.id === list.ownerId) return c.redirect(back(), 303);

  const body = await c.req.parseBody();
  const wishId = Number(body['id']);
  const [wish] = Number.isInteger(wishId)
    ? await db
        .select({ id: wishes.id })
        .from(wishes)
        .where(and(eq(wishes.id, wishId), eq(wishes.listId, list.id)))
    : [];
  if (!wish) return c.redirect(back('?borta=1'), 303);

  const cookie = { path: '/', maxAge: ONE_YEAR, httpOnly: true, sameSite: 'Lax', secure: c.req.url.startsWith('https:') } as const;
  const token = giverToken(getCookie(c, TOKEN_COOKIE), body['nyckel']);

  if (body['intent'] === 'angra') {
    await db
      .delete(reservations)
      .where(and(eq(reservations.wishId, wish.id), eq(reservations.tokenHash, await hashToken(token))));
    return c.redirect(back(`?angrad=${wish.id}`), 303);
  }

  const name = parseGiverName(body['namn']);
  if (!name) return c.redirect(back('?fel=1'), 303);

  // The unique index on wish_id decides who wins when two givers press at once.
  const tokenHash = await hashToken(token);
  const inserted = await db
    .insert(reservations)
    .values({ wishId: wish.id, name, tokenHash })
    .onConflictDoNothing()
    .returning({ id: reservations.id });
  // Not inserted means someone holds it already. That someone can be her:
  // a second press on the button, a moment after the first.
  const [holder] = inserted.length > 0 ? [] : await db.select({ tokenHash: reservations.tokenHash }).from(reservations).where(eq(reservations.wishId, wish.id));
  const outcome = reserveOutcome(inserted.length > 0, holder?.tokenHash, tokenHash);

  setCookie(c, TOKEN_COOKIE, token, cookie);
  setCookie(c, NAME_COOKIE, name, cookie);
  return c.redirect(back(outcome === 'reserved' ? `?paxad=${wish.id}` : '?upptagen=1'), 303);
});

export const head = defineHead<Props>((_c, props) => {
  const title = `${props.displayName} vill ha`;
  // The owner's own greeting makes the best link preview; the standard line is the fallback.
  const description = props.intro?.trim() || `${possessive(props.displayName)} önskelista. Paxa det du tänker köpa, utan konto.`;
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `/${props.username}` },
      { property: 'og:image', content: props.avatarKey ? `/bild/${props.avatarKey}` : '/icons/icon-512.png' },
    ],
  };
});
