import { defineHandler, defineHead, type InferProps } from 'void';
import { getAuth, requireAuth } from 'void/auth';
import { db, eq } from 'void/db';
import type { RouteUrl } from 'void/routes';
import { userTable } from '@auth-schema';
import { lists } from '@schema';
import { deleteAccount } from '../src/account';
import { resolveImageChange, writeWithImage } from '../src/image-lifecycle';
import { deleteImage, saveImage } from '../src/images';
import { isPlaceholderEmail, parseRecoveryEmail, placeholderEmail } from '../src/recovery-email';
import { sendAddressConfirmation } from '../src/recovery-mail';
import { confirmsDeletion } from '../src/username';

export type Props = InferProps<typeof loader>;

export const prerender = false;

export const loader = defineHandler(async (c) => {
  const user = requireAuth(c, { throwRedirect: '/login' });
  const [list] = await db.select().from(lists).where(eq(lists.ownerId, user.id));
  if (!list) return c.notFound();
  const saved = c.req.query('sparat');
  return {
    username: list.username,
    displayName: list.displayName,
    avatarKey: list.avatarKey,
    intro: list.intro ?? '',
    email: isPlaceholderEmail(user.email) ? null : user.email,
    saved:
      saved === 'epost' ||
      saved === 'upptagen' ||
      saved === 'ogiltig' ||
      saved === 'lista' ||
      saved === 'fel-namn' ||
      saved === 'fel-bild' ||
      saved === 'bild'
        ? saved
        : null,
    // She came in through the mailed link and has no key on this device yet.
    recovered: c.req.query('aterstalld') === '1',
  };
});

// Back to the section that was saved, so the answer is on screen.
const back = (saved: string, section: string) => `/konto?sparat=${saved}#${section}` as RouteUrl;

export const action = defineHandler(async (c) => {
  const user = requireAuth(c, { throwRedirect: '/login' });
  const body = await c.req.parseBody();

  if (body['intent'] === 'logout') {
    const response = await getAuth(c).api.signOut({ headers: c.req.raw.headers, asResponse: true });
    for (const cookie of response.headers.getSetCookie()) c.header('Set-Cookie', cookie, { append: true });
    return c.redirect('/', 303);
  }

  if (body['intent'] === 'delete') {
    const [list] = await db.select({ username: lists.username }).from(lists).where(eq(lists.ownerId, user.id));
    if (!list || !confirmsDeletion(body['bekrafta'], list.username)) return c.redirect(back('fel-namn', 'fara-rubrik'), 303);
    // Signs out first, while the session still exists, to get the cookies cleared.
    const response = await getAuth(c).api.signOut({ headers: c.req.raw.headers, asResponse: true });
    await deleteAccount(user.id);
    for (const cookie of response.headers.getSetCookie()) c.header('Set-Cookie', cookie, { append: true });
    return c.redirect('/?borttaget=1', 303);
  }

  // The profile picture saves on its own, as soon as one is chosen or removed.
  if (body['intent'] === 'avatar') {
    const [list] = await db.select().from(lists).where(eq(lists.ownerId, user.id));
    if (!list) return c.redirect('/konto', 303);

    const uploaded = await saveImage(list.id, body['bild'], 'a');
    if (uploaded === 'bad') return c.redirect('/konto?sparat=fel-bild', 303);
    const { imageKey: avatarKey, discard } = resolveImageChange({
      uploaded,
      removeRequested: body['tabortbild'] !== undefined,
      current: list.avatarKey,
    });

    await writeWithImage(uploaded, () => db.update(lists).set({ avatarKey }).where(eq(lists.id, list.id)), deleteImage);
    await deleteImage(discard);
    return c.redirect('/konto?sparat=bild', 303);
  }

  if (body['intent'] === 'list') {
    const displayName = String(body['namn'] ?? '')
      .trim()
      .slice(0, 40);
    const intro = String(body['intro'] ?? '')
      .trim()
      .slice(0, 300);
    if (displayName) {
      await db
        .update(lists)
        .set({ displayName, intro: intro === '' ? null : intro })
        .where(eq(lists.ownerId, user.id));
    }
    return c.redirect(back('lista', 'lista-rubrik'), 303);
  }

  const input = String(body['epost'] ?? '').trim();
  // An empty field removes the address again.
  const email = input === '' ? placeholderEmail(user.name) : parseRecoveryEmail(input);
  if (!email) return c.redirect(back('ogiltig', 'epost-rubrik'), 303);

  const [other] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
  if (other && other.id !== user.id) return c.redirect(back('upptagen', 'epost-rubrik'), 303);

  await db.update(userTable).set({ email, emailVerified: false }).where(eq(userTable.id, user.id));
  // A mail to the new address shows her at once whether she typed it right.
  if (input !== '' && email !== user.email) await sendAddressConfirmation(email);
  return c.redirect(back('epost', 'epost-rubrik'), 303);
});

export const head = defineHead(() => ({ title: 'Ditt konto – Jag vill ha' }));
