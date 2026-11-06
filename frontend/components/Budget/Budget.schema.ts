import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../../constants/catogories";

export const budgetSchema = z.object({
    category: z.custom<(typeof EXPENSE_CATEGORIES)[number]["key"]>(
        (value) => EXPENSE_CATEGORIES.some((category) => category.key === value),
        "Please select a valid category"
    ),

    amount: z.string()
        .min(1, "Please enter an amount")
        .refine(
            (value) => Number.isFinite(Number(value)) && Number(value) > 0,
            "Please enter a valid amount"
        ),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;