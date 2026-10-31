import { pgTable, uuid, varchar, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { accounts } from "./accounts.js";

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),

    account_id: uuid("account_id")
        .notNull()
        .references(() => accounts.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 50 }).notNull(),

    amount: numeric("amount").notNull(),

    category: varchar("category", { length: 100 }),

    description: varchar("description", { length: 255 }),

    date: timestamp("date").notNull(),

    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    status: varchar("status", { length: 50 }).notNull(),

    input_method: varchar("input_method", { length: 50 }),

    voice_transcript: varchar("voice_transcript", { length: 1000 }),

    is_flagged: boolean("is_flagged").notNull().default(false),

    flag_reason: varchar("flag_reason", { length: 255 }),

    created_at: timestamp("created_at").notNull().defaultNow(),

    updated_at: timestamp("updated_at").notNull().defaultNow(),
});