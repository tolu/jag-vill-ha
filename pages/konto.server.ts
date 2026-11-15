import { defineHandler, defineHead, type InferProps } from 'void';
import { getAuth, requireAuth } from 'void/auth';
import { db, eq } from 'void/db';
import { userTable } from '@auth-schema';
import { lists } from '@schema';
import { isPlaceholderEmail, parseRecoveryEmail, placeholderEmail } from '../src/recovery-email';

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
    intro: list.intro ?? '',
    email: isPlaceholderEmail(user.email) ? null : user.email,
    saved: saved === 'epost' || saved === 'upptagen' || saved === 'ogiltig' || saved === 'lista' ? saved : null,
  };
});

export const action = defineHandler(async (c) => {
  const user = requireAuth(c, { throwRedirect: '/login' });
  const body = await c.req.parseBody();

  if (body['intent'] === 'logout') {
    const response = await getAuth(c).api.signOut({ headers: c.req.raw.headers, asResponse: true });
    for (const cookie of response.headers.getSetCookie()) c.header('Set-Cookie', cookie, { append: true });
    return c.redirect('/', 303);
  }

  if (body['intent'] === 'list') {
    const displayName = String(body['namn'] ?? '').trim().slice(0, 40);
    const intro = String(body['intro'] ?? '').trim().slice(0, 300);
    if (displayName) {
      await db
        .update(lists)
        .set({ displayName, intro: intro === '' ? null : intro })
        .where(eq(lists.ownerId, user.id));
    }
    return c.redirect('/konto?sparat=lista', 303);
  }

  const input = String(body['epost'] ?? '').trim();
  // An empty field removes the address again.
  const email = input === '' ? placeholderEmail(user.name) : parseRecoveryEmail(input);
  if (!email) return c.redirect('/konto?sparat=ogiltig', 303);

  const [other] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
  if (other && other.id !== user.id) return c.redirect('/konto?sparat=upptagen', 303);

  await db.update(userTable).set({ email, emailVerified: false }).where(eq(userTable.id, user.id));
  return c.redirect('/konto?sparat=epost', 303);
});

export const head = defineHead(() => ({ title: 'Ditt konto – Jag vill ha' }));
