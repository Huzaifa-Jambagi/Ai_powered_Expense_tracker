import { z } from "zod";

const accountTypeSchema = z.enum(["CASH", "BANK", "CREDIT_CARD", "OTHER"]);

const balanceSchema = z.string()
    .trim()
    .max(30)
    .regex(/^\d+(\.\d+)?$/, "Invalid balance");

export const createAccountSchema = z.object({
    name: z.string().trim().min(1, "Account name is required").max(255),
    type: accountTypeSchema,
    opening_balance: balanceSchema,
});

export const accountIdSchema = z.string().uuid();

export const updateAccountSchema = z.object({
    name: z.string().trim().min(1, "Account name is required").max(255).optional(),
    type: accountTypeSchema.optional(),
    balance: balanceSchema.optional(),
}).strict().refine(
    data => data.name !== undefined || data.type !== undefined || data.balance !== undefined,
    { message: "At least one field must be provided" }
);

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;