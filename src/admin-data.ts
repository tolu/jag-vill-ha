import { getSession, getUser } from 'void/auth';
import { and, db, eq, gt, gte, isNull, ne, or } from 'void/db';
import { verificationTable } from '@auth-schema';
// The typed values: what defineEnv returns is the same object as void/env's `env`.
import env from '../env';
import { lists, reservations, wishes } from '@schema';
import { isAdmin, passkeyProofId } from './admin';

/** The logged-in admin, or null for everyone else: the pages then answer 404. */
export function currentAdmin() {
  const user = getUser();
  return user && isAdmin(user.id, env.ADMIN_USER_ID) ? user : null;
}

/**
 * When reservations were made, and nothing else about them. The admin is an
 * owner too and must not learn what is reserved on their own list, so that
 * list is left out. This is the only place the admin pages read the table.
 */
export async function reservationTimes(adminId: string, since: string) {
  const rows = await db
    .select({ at: reservations.createdAt })
    .from(reservations)
    .innerJoin(wishes, eq(reservations.wishId, wishes.id))
    .innerJoin(lists, eq(wishes.listId, lists.id))
    .where(and(gte(reservations.createdAt, since), or(isNull(lists.ownerId), ne(lists.ownerId, adminId))));
  return rows.map((row) => row.at);
}

/**
 * Whether this session began with a passkey prompt in the last few minutes.
 * auth.ts leaves the proof when a passkey login is verified; a session from a
 * mailed link never has one.
 */
export async function hasPasskeyProof() {
  const sessionId = getSession()?.session.id;
  if (!sessionId) return false;
  const rows = await db
    .select({ id: verificationTable.id })
    .from(verificationTable)
    .where(and(eq(verificationTable.identifier, passkeyProofId(sessionId)), gt(verificationTable.expiresAt, new Date())));
  return rows.length > 0;
}
