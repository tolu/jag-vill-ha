import { defineHandler, defineHead, type InferProps } from 'void';
import { count, db, eq } from 'void/db';
import type { RouteUrl } from 'void/routes';
import { lists, wishes } from '@schema';
import { deleteAccount } from '../../src/account';
import { deletable } from '../../src/admin';
import { currentAdmin, hasPasskeyProof } from '../../src/admin-data';
import { confirmsDeletion } from '../../src/username';

export type Props = InferProps<typeof loader>;

export const prerender = false;

/** The list the admin asked for, if it is one the admin may delete. */
async function target(username: string | undefined, adminId: string) {
  const [list] = username ? await db.select().from(lists).where(eq(lists.username, username)) : [];
  return list && deletable(list.ownerId, adminId) ? { ...list, ownerId: list.ownerId } : null;
}

export const loader = defineHandler(async (c) => {
  const admin = currentAdmin();
  if (!admin) return c.notFound();
  const list = await target(c.req.query('list'), admin.id);
  if (!list) return c.notFound();

  const [wishCount] = await db.select({ n: count() }).from(wishes).where(eq(wishes.listId, list.id));
  return {
    username: list.username,
    wishes: wishCount?.n ?? 0,
    // Without a passkey prompt in the last few minutes there is no form to send.
    proven: await hasPasskeyProof(),
    wrongName: c.req.query('wrong') === '1',
  };
});

export const action = defineHandler(async (c) => {
  const admin = currentAdmin();
  if (!admin) return c.notFound();
  const body = await c.req.parseBody();
  const list = await target(typeof body['list'] === 'string' ? body['list'] : undefined, admin.id);
  if (!list) return c.notFound();

  const back = `/admin/delete?list=${list.username}`;
  if (!(await hasPasskeyProof())) return c.redirect(back as RouteUrl, 303);
  if (!confirmsDeletion(body['confirm'], list.username)) return c.redirect(`${back}&wrong=1` as RouteUrl, 303);

  await deleteAccount(list.ownerId);
  // The only record of it: Workers Logs keeps this line.
  console.log(`Admin deleted the account ${list.username}.`);
  return c.redirect(`/admin/accounts?deleted=${list.username}` as RouteUrl, 303);
});

export const head = defineHead(() => ({ title: 'Delete account – Admin – Jag vill ha' }));
