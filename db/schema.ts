import { sql } from 'void/db';
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'void/schema-d1';

// One list per account for now; the username is its public address.
export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  displayName: text('display_name').notNull(),
  intro: text('intro'),
  // The owner's own picture, shown at the top of the public list.
  avatarKey: text('avatar_key'),
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
export const reservations = sqliteTable(
  'reservations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    wishId: integer('wish_id')
      .notNull()
      .references(() => wishes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    tokenHash: text('token_hash').notNull(),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  // One reservation per wish: two givers pressing "Paxa" at once cannot both win.
  (table) => [uniqueIndex('reservations_wish_id_unique').on(table.wishId)],
);

// How many times a list was opened by someone other than its owner, per day.
// A number and nothing else: no visitor, no address, no time of day.
export const visits = sqliteTable(
  'visits',
  {
    listId: integer('list_id')
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    // A UTC day, "2026-11-18".
    day: text('day').notNull(),
    count: integer('count').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.listId, table.day] })],
);
