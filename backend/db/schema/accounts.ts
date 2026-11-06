import { pgTable, uuid, varchar, numeric, boolean, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const accountTypeEnum = pgEnum("account_type", [
  "CASH", "BANK", "CREDIT_CARD", "SAVINGS"
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull().default("BANK"),

  type: accountTypeEnum("type").notNull().default("BANK"),

  balance: numeric("balance", { mode: "number" })
    .notNull()
    .default(0),
  is_default: boolean("is_default").notNull().default(false),

  created_at: timestamp("created_at").notNull().defaultNow(),

  user_id: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.clerk_id, { onDelete: "cascade" }),
}, (table) => [
  index("accounts_user_id_idx").on(table.user_id),
]);