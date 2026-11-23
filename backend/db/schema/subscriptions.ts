import { users } from "./users.js";
import { pgTable, uuid, varchar, numeric, timestamp, date, integer, index, pgEnum, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const billingUnitEnum = pgEnum("billing_unit", [
    "DAY",
    "WEEK",
    "MONTH",
    "YEAR",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "ACTIVE",
    "PAUSED",
    "CANCELLED",
]);

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),

    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.clerk_id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    billing_interval: integer("billing_interval").notNull().default(1),

    billing_unit: billingUnitEnum("billing_unit").notNull().default("MONTH"),

    next_billing_date: date("next_billing_date", { mode: "string" }).notNull(),

    status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),

    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("subscriptions_user_status_billing_date_idx").on(
        table.user_id,
        table.status,
        table.next_billing_date
    ),

    check("subscriptions_amount_positive", sql`${table.amount} > 0`),

    check("subscriptions_billing_interval_positive", sql`${table.billing_interval} > 0`),
]);