import { accountTable, passkeyTable, sessionTable, userTable } from '@auth-schema';
import { db, eq, inArray } from 'void/db';
import { lists, reservations, visits, wishes } from '@schema';
import { deleteImage } from './images';

/**
 * Removes everything an owner has here: the list, its wishes and their
 * reservations, the count of its visits, the stored pictures, the passkeys and sessions, and the user.
 * Rows go first and pictures last, so a failure half-way can leave a stray
 * picture but never a wish pointing at a picture that is gone.
 */
export async function deleteAccount(userId: string) {
  const ownLists = await db.select({ id: lists.id, avatarKey: lists.avatarKey }).from(lists).where(eq(lists.ownerId, userId));
  const listIds = ownLists.map((list) => list.id);
  const ownWishes = listIds.length
    ? await db.select({ id: wishes.id, imageKey: wishes.imageKey }).from(wishes).where(inArray(wishes.listId, listIds))
    : [];
  const wishIds = ownWishes.map((wish) => wish.id);

  // Deleted table by table rather than relying on cascades alone.
  if (wishIds.length) {
    await db.delete(reservations).where(inArray(reservations.wishId, wishIds));
    await db.delete(wishes).where(inArray(wishes.id, wishIds));
  }
  if (listIds.length) {
    await db.delete(visits).where(inArray(visits.listId, listIds));
    await db.delete(lists).where(inArray(lists.id, listIds));
  }
  await db.delete(passkeyTable).where(eq(passkeyTable.userId, userId));
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  await db.delete(accountTable).where(eq(accountTable.userId, userId));
  await db.delete(userTable).where(eq(userTable.id, userId));

  for (const wish of ownWishes) await deleteImage(wish.imageKey);
  for (const list of ownLists) await deleteImage(list.avatarKey);
}
