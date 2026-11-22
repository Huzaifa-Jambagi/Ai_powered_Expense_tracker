import { z } from "zod";

export const createAccountSchema = z.object({
    name: z.string().trim().min(1, "Account name is required").max(255),
    type: z.enum(["CASH", "BANK", "CREDIT_CARD", "OTHER"]),
    opening_balance: z.string().trim().max(30).regex(/^\d+(\.\d+)?$/, "Invalid opening balance"),
});

const balanceSchema = z.string()
    .trim()
    .max(30)
    .regex(/^\d+(\.\d+)?$/, "Invalid balance");

export const accountIdSchema = z.string().uuid();

export const updateAccountSchema = z.object({
    name: z.string().trim().min(1, "Account name is required").max(255).optional(),
    balance: balanceSchema.optional(),
}).strict().refine(
    data => data.name !== undefined || data.balance !== undefined,
    { message: "At least one field must be provided" }
);

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type CreateAccountInput = z.infer<typeof createAccountSchema>;