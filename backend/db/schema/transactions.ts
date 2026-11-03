import { pgTable, uuid, varchar, numeric, timestamp, boolean, index, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { accounts } from "./accounts.js";

export const transactionTypeEnum = pgEnum("transaction_type", [
    "INCOME",
    "EXPENSE",
]);


export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),

    account_id: uuid("account_id")
        .notNull()
        .references(() => accounts.id, { onDelete: "cascade" }),

    type: transactionTypeEnum("type").notNull(),

    amount: numeric("amount", { mode: "number" }).notNull(),

    category: varchar("category", { length: 100 }).notNull(),

    description: varchar("description", { length: 255 }),

    date: timestamp("date").notNull(),

    user_id: varchar("user_id")
        .notNull()
        .references(() => users.clerk_id, { onDelete: "cascade" }),

    status: varchar("status", { length: 50 }).notNull(),

    input_method: varchar("input_method", { length: 50 }).notNull(),

    voice_transcript: varchar("voice_transcript", { length: 1000 }),

    is_flagged: boolean("is_flagged").notNull().default(false),

    flag_reason: varchar("flag_reason", { length: 255 }),

    created_at: timestamp("created_at").notNull().defaultNow(),

    updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("transactions_user_id_idx").on(table.user_id),
    index("transactions_account_id_idx").on(table.account_id),
    index("transactions_user_type_idx").on(table.user_id, table.type),
]);