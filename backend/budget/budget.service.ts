import { getMonthDateRange } from "../date.js";
import * as budgetRepository from "./budget.repository.js";
import type { BudgetCategory } from "./budget.validation.js";

export const getBudget = async (clerkId: string, month: string, timezone: string) => {
    const { startDate, endDate } = getMonthDateRange(month, timezone);

    const [budgets, expenses] = await Promise.all([
        budgetRepository.getBudget(clerkId),
        budgetRepository.getMonthlyExpenses(clerkId, startDate, endDate),
    ]);

    const expensesByCategory = new Map(
        expenses.map(({ category, spent }) => [category, spent])
    );

    return budgets.map((budget) => {
        const spent = expensesByCategory.get(budget.category) ?? 0;

        return {
            ...budget,
            spent,
            remaining: budget.amount - spent,
            percentage: (spent / budget.amount) * 100,
        };
    });
};

export const setBudget = async (clerkId: string, category: BudgetCategory, amount: number) => {
    return await budgetRepository.setBudget(clerkId, category, amount);
};

export const deleteBudget = async (clerkId: string, id: string) => {
    return await budgetRepository.deleteBudget(clerkId, id);
};