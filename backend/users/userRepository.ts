import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";
import { accounts } from "../db/schema/accounts.js";

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
    const [updatedUser] = await tx
      .update(users)
      .set({
        onboarding_completed: true,
        currency,
      })
      .where(eq(users.clerk_id, clerkId))
      .returning();

    const [account] = await tx
      .insert(accounts)
      .values({
        balance: startingBalance.toString(),
        is_default: true,
        user_id: clerkId,
      })
      .returning();
    console.log(updatedUser, account);
    return { user: updatedUser, account };
  });
};
