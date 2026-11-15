import { defineHandler, defineHead, type InferProps } from 'void';
import { asc, db, eq, inArray } from 'void/db';
import { lists, reservations, wishes } from '@schema';
import { checkUsername, normalizeUsername } from '../src/username';
import { isTaken, metaLine, possessive, thumbHue } from '../src/wish';

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const username = normalizeUsername(c.req.param('username') ?? '');
  if (checkUsername(username)) return c.notFound();

  const [list] = await db.select().from(lists).where(eq(lists.username, username));
  if (!list) return c.notFound();

  const wishRows = await db
    .select()
    .from(wishes)
    .where(eq(wishes.listId, list.id))
    .orderBy(asc(wishes.position), asc(wishes.id));

  const reservationRows = wishRows.length
    ? await db
        .select()
        .from(reservations)
        .where(inArray(reservations.wishId, wishRows.map((wish) => wish.id)))
    : [];

  return {
    username: list.username,
    displayName: list.displayName,
    intro: list.intro,
    wishes: wishRows.map((wish) => {
      const mine = reservationRows.filter((reservation) => reservation.wishId === wish.id);
      const reserved = mine.reduce((sum, reservation) => sum + reservation.quantity, 0);
      const taken = isTaken(wish.quantity, reserved);
      return {
        id: wish.id,
        title: wish.title,
        url: wish.url,
        icon: wish.icon,
        hue: thumbHue(wish.title),
        mostWanted: wish.mostWanted,
        meta: metaLine(wish, reserved),
        under500: wish.price !== null && wish.price < 500,
        taken,
        takenBy: taken ? mine.map((reservation) => reservation.name).join(', ') : null,
      };
    }),
  };
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
