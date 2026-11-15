import { HTTPException } from 'hono/http-exception';
import { requireAuth } from 'void/auth';
import { and, db, eq } from 'void/db';
import { lists, wishes } from '@schema';

type Ctx = Parameters<typeof requireAuth>[0];

/** The signed-in owner's list; sends everyone else to the login page. */
export async function requireOwnerList(c: Ctx) {
  const user = requireAuth(c, { throwRedirect: '/login' });
  const [list] = await db.select().from(lists).where(eq(lists.ownerId, user.id));
  if (!list) throw new HTTPException(404);
  return list;
}

/** A wish, but only if it belongs to the given list. */
export async function findOwnWish(listId: number, wishId: number) {
  if (!Number.isInteger(wishId)) return null;
  const [wish] = await db
    .select()
    .from(wishes)
    .where(and(eq(wishes.id, wishId), eq(wishes.listId, listId)));
  return wish ?? null;
}
