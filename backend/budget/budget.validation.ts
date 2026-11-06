import { z } from "zod";

export const budgetCategorySchema = z.enum([
    "food",
    "groceries",
    "transport",
    "shopping",
    "entertainment",
    "health",
    "utilities",
    "rent",
    "education",
    "travel",
    "insurance",
    "subscriptions",
    "emi",
    "personal_care",
    "other",
]);

export const getBudgetSchema = z.object({
    month: z.string().regex(
        /^\d{4}-(0[1-9]|1[0-2])$/,
        "Invalid month format. Expected YYYY-MM"
    ),
});

export const setBudgetSchema = z.object({
    category: budgetCategorySchema,
    amount: z.number()
        .finite("Amount must be a valid number")
        .positive("Amount must be greater than zero"),
});

export type SetBudgetInput = z.infer<typeof setBudgetSchema>;
export type BudgetCategory = z.infer<typeof budgetCategorySchema>;