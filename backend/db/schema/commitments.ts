import { users } from "./users.js";
import { pgTable, uuid, varchar, numeric, timestamp, text, index, uniqueIndex, pgEnum, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const commitmentTypeEnum = pgEnum("commitment_type", [
    "PAY",
    "RECEIVE",
]);

export const commitmentStatusEnum = pgEnum("commitment_status", [
    "OPEN",
    "CANCELLED",
]);

export const commitments = pgTable("commitments", {
    id: uuid("id").primaryKey().defaultRandom(),

    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.clerk_id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),

    counterparty: varchar("counterparty", { length: 255 }),

    type: commitmentTypeEnum("type").notNull(),

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    settled_amount: numeric("settled_amount", { precision: 12, scale: 2 })
        .notNull()
        .default("0"),

    category: varchar("category", { length: 100 }),

    notes: varchar("notes", { length: 155 }),

    status: commitmentStatusEnum("status").notNull().default("OPEN"),

    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    uniqueIndex("commitments_user_id_id_unique").on(table.user_id, table.id),

    index("commitments_user_type_status_idx").on(
        table.user_id,
        table.type,
        table.status
    ),

    check("commitments_amount_positive", sql`${table.amount} > 0`),

    check(
        "commitments_settled_amount_valid",
        sql`${table.settled_amount} >= 0 AND ${table.settled_amount} <= ${table.amount}`
    ),
]);