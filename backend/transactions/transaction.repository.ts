import { and, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { transactions } from "../db/schema/transactions.js";

export const getTransactions = async (clerkId: string, type?: "INCOME" | "EXPENSE", accountId?: string) => {
  return await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.user_id, clerkId),
        type ? eq(transactions.type, type) : undefined,
        accountId ? eq(transactions.account_id, accountId) : undefined,
      )
    );
};