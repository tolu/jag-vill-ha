import { defineHandler, defineHead, type InferProps } from 'void';
import { count, db } from 'void/db';
import { storage } from 'void/storage';
import { passkeyTable, sessionTable, userTable } from '@auth-schema';
import { lists, wishes } from '@schema';
import { lockoutRisk } from '../../src/admin';
import { currentAdmin, reservationTimes } from '../../src/admin-data';
import { isPlaceholderEmail } from '../../src/recovery-email';

export type Props = InferProps<typeof loader>;

export const prerender = false;

/** How many pictures are stored and what they weigh, a page at a time. */
async function storedPictures() {
  let objects = 0;
  let bytes = 0;
  let cursor: string | undefined;
  do {
    const page = await storage.list({ cursor });
    objects += page.objects.length;
    for (const object of page.objects) bytes += object.size;
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return { objects, megabytes: (bytes / 1_000_000).toFixed(1) };
}

const rows = async (table: Parameters<ReturnType<typeof db.select>['from']>[0]) => {
  const [row] = await db.select({ n: count() }).from(table);
  return row?.n ?? 0;
};

export const loader = defineHandler(async (c) => {
  const admin = currentAdmin();
  if (!admin) return c.notFound();

  const users = await db.select({ id: userTable.id, email: userTable.email }).from(userTable);
  const keys = await db.select({ userId: passkeyTable.userId }).from(passkeyTable);
  const atRisk = users.filter((user) =>
    lockoutRisk(keys.filter((key) => key.userId === user.id).length, !isPlaceholderEmail(user.email)),
  ).length;

  return {
    build: __BUILD__,
    lists: await rows(lists),
    wishes: await rows(wishes),
    reservations: (await reservationTimes(admin.id, '')).length,
    sessions: await rows(sessionTable),
    atRisk,
    pictures: await storedPictures(),
  };
});

export const head = defineHead(() => ({ title: 'System – Admin – Jag vill ha' }));
