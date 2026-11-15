import { defineHandler, type InferProps } from 'void';
import { db, desc } from 'void/db';
import { messages } from '@schema';

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const rows = await db.select().from(messages).orderBy(desc(messages.id));
  return { messages: rows };
});

export const action = defineHandler(async (c) => {
  const body = await c.req.parseBody();
  const text = String(body['text'] ?? '').trim();
  if (text) await db.insert(messages).values({ text });
  return c.redirect('/spike', 303);
});
