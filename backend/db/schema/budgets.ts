import { pgTable, uuid, numeric, timestamp,varchar,index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const budgets = pgTable("budgets", {
    id: uuid("id").primaryKey().defaultRandom(),

    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.clerk_id, { onDelete: "cascade" }),

    amount: numeric("amount").notNull(),

    last_alert_sent: timestamp("last_alert_sent"),

    last_alert_threshold: numeric("last_alert_threshold"),

    created_at: timestamp("created_at").notNull().defaultNow(),

    updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("budgets_user_id_idx").on(table.user_id),
]);