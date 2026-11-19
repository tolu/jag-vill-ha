import { defineHandler } from 'void';
import { getAuth } from 'void/auth';
import { db, eq } from 'void/db';
import type { RouteUrl } from 'void/routes';
import { userTable } from '@auth-schema';
import { lists, wishes } from '@schema';
import { DEV_OWNER, DEV_WISHES, takeDevLink } from '../../src/dev-login';
import { defaultDisplayName } from '../../src/username';

// Dev server only: logs in a test owner, made on the first visit, and goes to
// her list. In a build this answers 404 like any unknown address.
export const GET = defineHandler(async (c) => {
  if (!import.meta.env.DEV) return c.notFound();

  const [known] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, DEV_OWNER.email));
  if (!known) {
    const id = crypto.randomUUID();
    const now = new Date();
    // The address counts as proven, so logging in does not end her other sessions.
    await db.insert(userTable).values({ id, name: DEV_OWNER.username, email: DEV_OWNER.email, emailVerified: true, createdAt: now, updatedAt: now });
    const [list] = await db
      .insert(lists)
      .values({ username: DEV_OWNER.username, displayName: defaultDisplayName(DEV_OWNER.username), ownerId: id })
      .returning({ id: lists.id });
    await db.insert(wishes).values(DEV_WISHES.map((wish, index) => ({ ...wish, listId: list!.id, position: index + 1 })));
  }

  // The same one-time link as "Kommer du inte in?", followed at once instead of mailed.
  await getAuth(c).api.signInMagicLink({ body: { email: DEV_OWNER.email, callbackURL: '/lista' }, headers: c.req.raw.headers });
  const link = takeDevLink();
  if (!link) return c.text('No login link was made. Is the magic link plugin still in auth.ts?', 500);
  return c.redirect(link as RouteUrl);
});
