import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { budgets } from "../db/schema/budgets.js";

export const getBudget = async (clerkId: string) => {
  const [budget] = await db.select().from(budgets).where(eq(budgets.user_id, clerkId)).limit(1);
  return budget ?? null;
};

export const setBudget = async (clerkId: string, amount: number) => {
  const [budget] = await db
    .insert(budgets)
    .values({ user_id: clerkId, amount })
    .onConflictDoUpdate({
      target: budgets.user_id,
      set: { amount, updated_at: new Date() },
    })
    .returning();

  return budget;
};