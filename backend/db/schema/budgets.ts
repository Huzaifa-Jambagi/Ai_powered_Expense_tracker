import { pgTable, uuid, numeric, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const budgets = pgTable("budgets", {
    id: uuid("id").primaryKey().defaultRandom(),

    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    amount: numeric("amount").notNull(),

    last_alert_sent: timestamp("last_alert_sent"),

    last_alert_threshold: numeric("last_alert_threshold"),

    created_at: timestamp("created_at").notNull().defaultNow(),

    updated_at: timestamp("updated_at").notNull().defaultNow(),
});