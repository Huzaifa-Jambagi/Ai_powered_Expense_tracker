import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";

export const getUserDetails = async(clerkId: string)=> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerk_id, clerkId))
      .limit(1);

    return user ?? null;
  }

