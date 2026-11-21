import { z } from "zod";

export const getTransactionsSchema = z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month format"),
    accountId: z.string().uuid().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const getTransactionChartSchema = z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month format"),
    accountId: z.string().uuid().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

export const getExpenseBreakdownSchema = z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

const EXPENSE_CATEGORY_KEYS = [
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
    "investment",
] as const;

const INCOME_CATEGORY_KEYS = [
    "salary",
    "pocketMoney",
    "business",
    "investments",
    "gift",
    "other_income",
] as const;

const CATEGORY_KEYS = [
    ...EXPENSE_CATEGORY_KEYS,
    ...INCOME_CATEGORY_KEYS,
] as const;

const EXPENSE_CATEGORY_SET = new Set<string>(EXPENSE_CATEGORY_KEYS);
const INCOME_CATEGORY_SET = new Set<string>(INCOME_CATEGORY_KEYS);

export const addTransactionSchema = z.object({
    accountId: z.string().uuid("Invalid account ID"),

    type: z.enum(["INCOME", "EXPENSE"]),

    amount: z.string()
        .trim()
        .max(30)
        .regex(/^\d+(?:\.\d{1,2})?$/, "Invalid amount")
        .refine((value) => Number(value) > 0, "Amount must be greater than zero"),

    category: z.enum(CATEGORY_KEYS),

    description: z.string()
        .trim()
        .max(150, "Description cannot exceed 255 characters")
        .nullish()
        .transform((value) => value || null),

    date: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),

    input_method: z.enum(["manual", "scan", "mic"]),

    voice_transcript: z.string().max(1000).nullish(),
}).superRefine(({ type, category }, ctx) => {
    const valid = type === "EXPENSE"
        ? EXPENSE_CATEGORY_SET.has(category)
        : INCOME_CATEGORY_SET.has(category);

    if (!valid) {
        ctx.addIssue({
            code: "custom",
            path: ["category"],
            message: `Invalid category for ${type.toLowerCase()} transaction`,
        });
    }
});

export type AddTransactionInput = z.infer<typeof addTransactionSchema>;

export const deleteTransactionSchema = z.object({
    id: z.string().uuid(),
});