import { z } from "zod";
import { CATEGORIES, CategoryKey } from "../../constants/catogories";


const CATEGORY_KEYS = Object.keys(CATEGORIES) as [
    CategoryKey,
    ...CategoryKey[],
];

export const addTransactionSchema = z.object({
    type: z.enum(["EXPENSE", "INCOME"]),

    amount: z.string()
        .trim()
        .min(1, "Enter an amount")
        .max(30, "Amount is too large")
        .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
        .refine((value) => Number(value) > 0, "Amount must be greater than zero"),

    category: z.enum(CATEGORY_KEYS),

    accountId: z.string().uuid("Select an account"),

    date: z.date(),

    description: z.string()
        .trim()
        .max(150, "Description cannot exceed 255 characters"),
}).superRefine((values, ctx) => {
    if (CATEGORIES[values.category].type !== values.type) {
        ctx.addIssue({
            code: "custom",
            path: ["category"],
            message: "Category doesn't match transaction type",
        });
    }
});

export type AddTransactionFormValues = z.infer<typeof addTransactionSchema>;