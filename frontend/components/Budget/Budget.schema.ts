import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../../constants/catogories";

type ExpenseCategoryKey = (typeof EXPENSE_CATEGORIES)[number]["key"];

export const budgetSchema = z.object({
    category: z.string().refine(
        (value): value is ExpenseCategoryKey =>
            EXPENSE_CATEGORIES.some(({ key }) => key === value),
        "Please select a valid category"
    ),

    amount: z.string()
        .trim()
        .min(1, "Please enter an amount")
        .refine(
            (value) => Number.isFinite(Number(value)) && Number(value) > 0,
            "Please enter a valid amount"
        )
        .transform(Number),
});

export type BudgetFormInput = z.input<typeof budgetSchema>;
export type BudgetFormValues = z.output<typeof budgetSchema>;