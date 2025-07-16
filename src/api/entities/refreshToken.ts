import { pgTable, serial, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./user";

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 512 }).notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
