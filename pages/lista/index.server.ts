import { defineHandler, defineHead, type InferProps } from 'void';
import { getUser } from 'void/auth';
import { asc, db, eq, max } from 'void/db';
import { wishes } from '@schema';
import { WISH_ICONS } from '../../src/icons';
import { writeWithImage } from '../../src/image-lifecycle';
import { deleteImage, saveImage } from '../../src/images';
import { parseOrder } from '../../src/order';
import { isPlaceholderEmail } from '../../src/recovery-email';
import { findOwnWish, requireOwnerList } from '../../src/owner';
import { shopLabel, thumbHue } from '../../src/wish';
import { parseWishForm } from '../../src/wish-form';

export type Props = InferProps<typeof loader>;

export const prerender = false;

const ordered = (listId: number) =>
  db.select().from(wishes).where(eq(wishes.listId, listId)).orderBy(asc(wishes.position), asc(wishes.id));

// Reservations are deliberately never read here: the owner must not learn what is taken.
export const loader = defineHandler(async (c) => {
  const list = await requireOwnerList(c);
  const rows = await ordered(list.id);
  return {
    username: list.username,
    avatarKey: list.avatarKey,
    // Without an e-mail there is no way back in after a lost phone.
    needsEmail: isPlaceholderEmail(getUser()?.email ?? ''),
    failed: c.req.query('fel') === '1',
    // A new wish starts as a present, so nobody has to pick an icon and nobody gets an odd one.
    suggestedIcon: WISH_ICONS[0][0],
    wishes: rows.map((wish) => ({
      id: wish.id,
      title: wish.title,
      icon: wish.icon,
      imageKey: wish.imageKey,
      hue: thumbHue(wish.title),
      note: wish.note,
      url: wish.url,
      shop: wish.url ? shopLabel(wish.url) : null,
    })),
  };
});

export const action = defineHandler(async (c) => {
  const list = await requireOwnerList(c);
  const body = await c.req.parseBody();
  const intent = body['intent'];

  if (intent === 'add') {
    const form = parseWishForm(body);
    if (!form.ok) return c.redirect('/lista?fel=1', 303);
    const imageKey = await saveImage(list.id, body['bild']);
    if (imageKey === 'bad') return c.redirect('/lista?fel=1', 303);
    // If saving the wish fails, the picture stored a moment ago is removed again.
    await writeWithImage(
      imageKey,
      async () => {
        const [last] = await db.select({ position: max(wishes.position) }).from(wishes).where(eq(wishes.listId, list.id));
        await db.insert(wishes).values({ ...form.values, imageKey, listId: list.id, position: (last?.position ?? 0) + 1 });
      },
      deleteImage,
    );
    return c.redirect('/lista', 303);
  }

  // Sent by /js/list.js after a drag or an arrow-key move.
  if (intent === 'order') {
    const current = (await ordered(list.id)).map((row) => row.id);
    const next = parseOrder(String(body['ids'] ?? ''), current);
    if (!next) return c.json({ ok: false }, 400);
    for (const [index, id] of next.entries()) {
      if (current[index] !== id) await db.update(wishes).set({ position: index + 1 }).where(eq(wishes.id, id));
    }
    return c.json({ ok: true });
  }

  const wish = await findOwnWish(list.id, Number(body['id']));
  if (!wish) return c.redirect('/lista', 303);

  if (intent === 'delete') {
    await db.delete(wishes).where(eq(wishes.id, wish.id));
    await deleteImage(wish.imageKey);
  }

  return c.redirect('/lista', 303);
});

export const head = defineHead(() => ({ title: 'Din lista – Jag vill ha' }));
