import { sql } from 'void/db';
import { integer, sqliteTable, text } from 'void/schema-d1';

// One list per account for now; the username is its public address.
export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  displayName: text('display_name').notNull(),
  intro: text('intro'),
  // Set when login exists (step 3); references the auth user.
  ownerId: text('owner_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const wishes = sqliteTable('wishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url'),
  imageKey: text('image_key'),
  icon: text('icon'),
  note: text('note'),
  position: integer('position').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Never read for the list owner. The token lets the giver undo on the same device.
export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  wishId: integer('wish_id')
    .notNull()
    .references(() => wishes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  tokenHash: text('token_hash').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
