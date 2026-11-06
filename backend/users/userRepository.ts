import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";
import { accounts } from "../db/schema/accounts.js";
import { transactions } from "../db/schema/transactions.js";

export const getUserDetails = async (clerkId: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerk_id, clerkId))
    .limit(1);

  return user ?? null;
}

export const completeOnboarding = async (clerkId: string, startingBalance: number, currency: string) => {
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ onboarding_completed: true, currency })
      .where(eq(users.clerk_id, clerkId));

    const [account] = await tx
      .insert(accounts)
      .values({
        balance: startingBalance,
        is_default: true,
        user_id: clerkId,
      })
      .returning();

    await tx.insert(transactions).values({
      user_id: clerkId,
      account_id: account.id,
      type: "INCOME",
      amount: startingBalance,
      category: "other_income",
      description: "Starting balance",
      date: new Date(),
      input_method: "MANUAL",
      status: "COMPLETED",
    });
  });

  return true;
};
