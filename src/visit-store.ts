import { db, sql } from 'void/db';
import { visits } from '@schema';
import { toDay } from './activity';

/** Adds one to today's count for the list. A failure is logged and never reaches the visitor. */
export async function recordVisit(listId: number, now = new Date()) {
  try {
    await db
      .insert(visits)
      .values({ listId, day: toDay(now), count: 1 })
      .onConflictDoUpdate({ target: [visits.listId, visits.day], set: { count: sql`${visits.count} + 1` } });
  } catch (error) {
    console.error('Visit not counted:', error);
  }
}
