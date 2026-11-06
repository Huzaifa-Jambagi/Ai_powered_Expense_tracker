import { and, eq, gte, lt, sum, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { budgets } from "../db/schema/budgets.js";
import { transactions } from "../db/schema/transactions.js";
import type { BudgetCategory } from "./budget.validation.js";


export const getMonthlyExpenses = async (clerkId: string, startDate: Date, endDate: Date) => {
  return await db
    .select({
      category: transactions.category,
      spent: sql<number>`sum(${transactions.amount})::numeric`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.user_id, clerkId),
        eq(transactions.type, "EXPENSE"),
        gte(transactions.date, startDate),
        lt(transactions.date, endDate)
      )
    )
    .groupBy(transactions.category);
};


export const getBudget = async (clerkId: string) => {
  return await db
    .select()
    .from(budgets)
    .where(eq(budgets.user_id, clerkId));
};


export const setBudget = async (clerkId: string, category: BudgetCategory, amount: number) => {
    const [budget] = await db
        .insert(budgets)
        .values({
            user_id: clerkId,
            category,
            amount,
        })
        .onConflictDoUpdate({
            target: [budgets.user_id, budgets.category],
            set: {
                amount,
                updated_at: new Date(),
            },
        })
        .returning();

    return budget;
};