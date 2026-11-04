import { db } from "../db/db.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

export const find = async (clerk_id: string) => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerk_id, clerk_id))
        .limit(1);

    return user ?? null;
};

export const create = async (id: string, clerk_id: string, name: string, email: string,image_url:string) => {
    return db.insert(users).values({
        id,
        clerk_id,
        name,
        email,
        image_url,
        onboarding_completed: false
    });
};

export const update = async (clerk_id: string, name: string, email: string, image_url: string) => {
    return db.update(users)
        .set({ name, email, image_url })
        .where(eq(users.clerk_id, clerk_id))
        .returning();
};

export const remove = async (clerk_id: string) => {
    return db.delete(users)
        .where(eq(users.clerk_id, clerk_id))
        .returning();
};