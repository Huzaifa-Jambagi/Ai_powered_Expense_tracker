import { pgTable, uuid, varchar, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const accounts = pgTable("accounts", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 255 }).notNull(),

    type: varchar("type", { length: 50 }).notNull(),

    balance: numeric("balance").notNull().default("0"),

    is_default: boolean("is_default").notNull().default(false),

    created_at: timestamp("created_at").notNull().defaultNow(),

    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
});