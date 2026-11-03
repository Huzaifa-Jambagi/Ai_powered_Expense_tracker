import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { accounts } from "../db/schema/accounts.js";

export const getAccounts = async (clerkId: string) => {
  return await db
    .select()
    .from(accounts)
    .where(eq(accounts.user_id, clerkId));
};