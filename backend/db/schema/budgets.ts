import { pgTable,uuid,numeric,timestamp,varchar,uniqueIndex,index,check,} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

export const budgets = pgTable("budgets", {
    id: uuid("id").primaryKey().defaultRandom(),

    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.clerk_id, { onDelete: "cascade" }),

    category: varchar("category", { length: 100 }).notNull(),

    amount: numeric("amount", { mode: "number" }).notNull(),

    last_alert_sent: timestamp("last_alert_sent"),

    last_alert_threshold: numeric("last_alert_threshold", { mode: "number" }),

    created_at: timestamp("created_at").notNull().defaultNow(),

    updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    uniqueIndex("budgets_user_month_category_idx").on(
        table.user_id,
        table.category
    ),
    index("budgets_user_id_idx").on(table.user_id),
]);