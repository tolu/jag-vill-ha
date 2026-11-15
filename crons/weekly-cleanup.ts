import { lists, wishes } from '@schema';
import { sessionTable, verificationTable } from '@auth-schema';
import { defineScheduled } from 'void';
import { db, isNotNull, lt } from 'void/db';
import { storage } from 'void/storage';
import { findOrphans, sweepLooksSane } from '../src/cleanup';

// Mondays at 04:00 UTC. Traffic is low, so once a week is plenty.
export const cron = '0 4 * * 1';

/** Every stored object, a page at a time. */
async function listStored() {
  const objects: { key: string; uploaded: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await storage.list({ cursor });
    objects.push(...page.objects.map((object) => ({ key: object.key, uploaded: object.uploaded })));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return objects;
}

export default defineScheduled(async (controller) => {
  const now = new Date(controller.scheduledTime);

  // 1. Login rows that have run out. Nothing else removes them, and every
  //    login and passkey prompt leaves one behind.
  await db.delete(sessionTable).where(lt(sessionTable.expiresAt, now));
  await db.delete(verificationTable).where(lt(verificationTable.expiresAt, now));

  // 2. Stored pictures that no wish or list refers to any more.
  const wishKeys = await db.select({ key: wishes.imageKey }).from(wishes).where(isNotNull(wishes.imageKey));
  const avatarKeys = await db.select({ key: lists.avatarKey }).from(lists).where(isNotNull(lists.avatarKey));
  const referenced = new Set([...wishKeys, ...avatarKeys].map((row) => row.key!));

  const stored = await listStored();
  const orphans = findOrphans(stored, referenced, now);
  if (!sweepLooksSane(stored.length, orphans.length)) {
    console.error(`Clean-up refused: ${orphans.length} of ${stored.length} stored pictures look unused. Nothing was deleted.`);
    return;
  }
  for (const key of orphans) await storage.delete(key);
  console.log(`Clean-up: removed ${orphans.length} of ${stored.length} stored pictures.`);
});
