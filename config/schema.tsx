import { create } from "domain";
import { integer, pgTable, text, varchar,json } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().notNull().default(0),
});

export const sessionChatTable = pgTable("session_chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  sessionId: varchar({ length: 255 }).notNull(),

  note: text(),
  selectedDoctor:json(),
  conversation: json(),   // ✅ correct JSON type
  report: json(),

  createdBy: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.email),

  createdOn: varchar({ length: 255 }).notNull(),
});
