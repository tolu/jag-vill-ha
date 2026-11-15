import { getCookie, setCookie } from 'hono/cookie';
import { defineHandler, defineHead, type InferProps } from 'void';
import { getUser } from 'void/auth';
import { and, asc, db, eq, inArray } from 'void/db';
import type { RouteUrl } from 'void/routes';
import { lists, reservations, wishes } from '@schema';
import { hashToken, newToken, parseGiverName, publicWishes, reservationsForViewer } from '../src/reservation';
import { checkUsername, normalizeUsername } from '../src/username';
import { possessive, shopLabel, thumbHue } from '../src/wish';

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
  const reservationRows = await reservationsForViewer(isOwner, async () =>
    wishRows.length
      ? db
          .select()
          .from(reservations)
          .where(inArray(reservations.wishId, wishRows.map((wish) => wish.id)))
      : [],
  );

  const token = getCookie(c, TOKEN_COOKIE);
  const notice = c.req.query('upptagen') === '1' ? 'taken' : c.req.query('fel') === '1' ? 'name' : null;

  return {
    username: list.username,
    displayName: list.displayName,
    intro: list.intro,
    isOwner,
    notice: notice as 'taken' | 'name' | null,
    giverName: getCookie(c, NAME_COOKIE) ?? '',
    wishes: publicWishes(wishRows, reservationRows, token ? await hashToken(token) : null).map((wish) => ({
      ...wish,
      hue: thumbHue(wish.title),
      shop: wish.url ? shopLabel(wish.url) : null,
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
  if (!wish) return c.redirect(back(), 303);

  const cookie = { path: '/', maxAge: ONE_YEAR, httpOnly: true, sameSite: 'Lax', secure: c.req.url.startsWith('https:') } as const;
  const token = getCookie(c, TOKEN_COOKIE) ?? newToken();

  if (body['intent'] === 'angra') {
    await db
      .delete(reservations)
      .where(and(eq(reservations.wishId, wish.id), eq(reservations.tokenHash, await hashToken(token))));
    return c.redirect(back(), 303);
  }

  const name = parseGiverName(body['namn']);
  if (!name) return c.redirect(back('?fel=1'), 303);

  // The unique index on wish_id decides who wins when two givers press at once.
  const inserted = await db
    .insert(reservations)
    .values({ wishId: wish.id, name, tokenHash: await hashToken(token) })
    .onConflictDoNothing()
    .returning({ id: reservations.id });

  setCookie(c, TOKEN_COOKIE, token, cookie);
  setCookie(c, NAME_COOKIE, name, cookie);
  return c.redirect(back(inserted.length > 0 ? '' : '?upptagen=1'), 303);
});

export const head = defineHead<Props>((_c, props) => {
  const title = `${props.displayName} vill ha`;
  const description = `${possessive(props.displayName)} önskelista. Paxa det du tänker köpa, utan konto.`;
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `/${props.username}` },
      { property: 'og:image', content: '/icons/icon-512.png' },
    ],
  };
});
