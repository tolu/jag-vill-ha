import { defineHandler, defineHead, type InferProps } from 'void';
import { db, eq } from 'void/db';
import { reservations, wishes } from '@schema';
import { WISH_ICONS } from '../../src/icons';
import { resolveImageChange, writeWithImage } from '../../src/image-lifecycle';
import { deleteImage, saveImage } from '../../src/images';
import { findOwnWish, requireOwnerList } from '../../src/owner';
import { parseWishForm } from '../../src/wish-form';

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const list = await requireOwnerList(c);
  const wish = await findOwnWish(list.id, Number(c.req.param('id')));
  if (!wish) return c.notFound();
  return {
    id: wish.id,
    failed: c.req.query('fel') === '1',
    wasReset: c.req.query('nollstalld') === '1',
    icon: wish.icon ?? WISH_ICONS[0][0],
    values: { title: wish.title, url: wish.url, note: wish.note, icon: wish.icon, imageKey: wish.imageKey },
  };
});

export const action = defineHandler(async (c) => {
  const list = await requireOwnerList(c);
  const wish = await findOwnWish(list.id, Number(c.req.param('id')));
  if (!wish) return c.notFound();
  const body = await c.req.parseBody();

  // Blind on purpose: deletes without reading, and answers the same either way,
  // so the owner cannot tell whether the wish was reserved.
  if (body['intent'] === 'reset') {
    await db.delete(reservations).where(eq(reservations.wishId, wish.id));
    return c.redirect(`/lista/${wish.id}?nollstalld=1`, 303);
  }

  const form = parseWishForm(body);
  if (!form.ok) return c.redirect(`/lista/${wish.id}?fel=1`, 303);

  // A new file replaces the picture; the checkbox (or picking an icon) removes it.
  const uploaded = await saveImage(list.id, body['bild']);
  if (uploaded === 'bad') return c.redirect(`/lista/${wish.id}?fel=1`, 303);
  const { imageKey, discard } = resolveImageChange({
    uploaded,
    removeRequested: body['tabortbild'] !== undefined,
    current: wish.imageKey,
  });

  // The old picture is only removed once the wish no longer points at it, and
  // a new one is removed again if the wish could not be saved.
  await writeWithImage(
    uploaded,
    () => db.update(wishes).set({ ...form.values, imageKey }).where(eq(wishes.id, wish.id)),
    deleteImage,
  );
  await deleteImage(discard);
  return c.redirect('/lista', 303);
});

export const head = defineHead(() => ({ title: 'Ändra önskning – Jag vill ha' }));
