import { pgTable, varchar, index, uuid ,timestamp} from "drizzle-orm/pg-core";
import * as p from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey(),

    clerk_id: varchar("clerk_id", { length: 64 }).notNull().unique(),

    name: varchar("name", { length: 255 }).notNull(),

    email: varchar("email", { length: 255 }).notNull().unique(),

    image_url: varchar("image_url", { length: 255 }),

    currency: varchar("currency", { length: 3 })
        .notNull()
        .default("INR"),

    created_at: timestamp("created_at").notNull().defaultNow(),

    onboarding_completed: p.boolean("onboarding_completed").notNull().default(false),
    
}, (table) => [
    index("users_clerk_id_idx").on(table.clerk_id)
]);