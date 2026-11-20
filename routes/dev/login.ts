import { defineHandler } from 'void';
import { getAuth } from 'void/auth';
import { db, eq } from 'void/db';
import type { RouteUrl } from 'void/routes';
import { userTable } from '@auth-schema';
import { lists, wishes } from '@schema';
import { DEV_WISHES, devOwner, takeDevLink } from '../../src/dev-login';
import { defaultDisplayName } from '../../src/username';

// Dev server only: logs in a test owner, made on the first visit, and goes to
// her list. `?som=chrome` is `testare-chrome`, another owner with a list of its
// own. In a build this answers 404 like any unknown address.
export const GET = defineHandler(async (c) => {
  if (!import.meta.env.DEV) return c.notFound();
  const owner = devOwner(c.req.query('som'));

  const [known] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, owner.email));
  if (!known) {
    const id = crypto.randomUUID();
    const now = new Date();
    // The address counts as proven, so logging in does not end her other sessions.
    await db.insert(userTable).values({ id, name: owner.username, email: owner.email, emailVerified: true, createdAt: now, updatedAt: now });
    const [list] = await db
      .insert(lists)
      .values({ username: owner.username, displayName: defaultDisplayName(owner.username), ownerId: id })
      .returning({ id: lists.id });
    await db.insert(wishes).values(DEV_WISHES.map((wish, index) => ({ ...wish, listId: list!.id, position: index + 1 })));
  }

  // The same one-time link as "Kommer du inte in?", followed at once instead of mailed.
  await getAuth(c).api.signInMagicLink({ body: { email: owner.email, callbackURL: '/lista' }, headers: c.req.raw.headers });
  const link = takeDevLink();
  if (!link) return c.text('No login link was made. Is the magic link plugin still in auth.ts?', 500);
  return c.redirect(link as RouteUrl);
});
