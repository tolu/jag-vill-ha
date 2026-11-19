import { defineHandler, defineHead, type InferProps } from 'void';
import { db, desc } from 'void/db';
import { sessionTable, userTable } from '@auth-schema';
import { lists, visits, wishes } from '@schema';
import { bucket, dailyTotals, shortDate, toDay, total } from '../../src/activity';
import { deletable } from '../../src/admin';
import { currentAdmin } from '../../src/admin-data';
import { isPlaceholderEmail } from '../../src/recovery-email';

export type Props = InferProps<typeof loader>;

export const prerender = false;

const WEEKS = 12;

// Counts and dates only. What a list holds is on its public page like for
// anyone else, and the e-mail address itself is never sent to this page.
export const loader = defineHandler(async (c) => {
  const admin = currentAdmin();
  if (!admin) return c.notFound();

  const now = new Date();
  const listRows = await db
    .select({ id: lists.id, username: lists.username, ownerId: lists.ownerId, createdAt: lists.createdAt })
    .from(lists)
    .orderBy(desc(lists.createdAt));
  const wishRows = await db.select({ listId: wishes.listId }).from(wishes);
  const visitRows = await db.select().from(visits);
  const users = await db.select({ id: userTable.id, email: userTable.email, verified: userTable.emailVerified }).from(userTable);
  const sessions = await db.select({ userId: sessionTable.userId, at: sessionTable.updatedAt }).from(sessionTable);

  return {
    // Said back after a delete. Only shown when that list really is gone.
    deleted: listRows.some((list) => list.username === c.req.query('deleted')) ? null : (c.req.query('deleted') ?? null),
    accounts: listRows.map((list) => {
      const visited = dailyTotals(
        visitRows.filter((visit) => visit.listId === list.id),
        now,
        WEEKS * 7,
      );
      const user = users.find((row) => row.id === list.ownerId);
      const hasEmail = Boolean(user) && !isPlaceholderEmail(user!.email);
      const seen = sessions.filter((session) => session.userId === list.ownerId).map((session) => session.at.getTime());
      return {
        username: list.username,
        isAdmin: list.ownerId === admin.id,
        deletable: deletable(list.ownerId, admin.id),
        // The year only when it is not this one: the table has to fit without scrolling.
        created: shortDate(toDay(list.createdAt), !list.createdAt.startsWith(String(now.getUTCFullYear()))),
        // Sessions that have run out are cleaned away, so an owner who has been gone a month has none.
        lastSeen: seen.length ? shortDate(toDay(new Date(Math.max(...seen)))) : null,
        visits: total(visited),
        weeks: bucket(visited, 7).map((week) => week.count),
        wishes: wishRows.filter((wish) => wish.listId === list.id).length,
        email: !hasEmail ? ('none' as const) : user!.verified ? ('confirmed' as const) : ('unconfirmed' as const),
      };
    }),
  };
});

export const head = defineHead(() => ({ title: 'Accounts – Admin – Jag vill ha' }));
