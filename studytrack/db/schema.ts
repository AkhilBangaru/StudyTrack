import { pgTable, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
export const records = pgTable('study_records', {
  owner: text('owner').notNull(),
  id: text('id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('todo'),
  due: text('due').notNull().default(''),
  minutes: integer('minutes').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => [primaryKey({ columns: [table.owner, table.id] })]);
