import { z } from "zod";

const amountSchema = z.union([z.string(), z.number()])
    .transform(String)
    .refine(value => /^\d{1,10}(\.\d{1,2})?$/.test(value) && Number(value) > 0, "Enter a valid amount greater than zero");

export const createCommitmentSchema = z.object({
    name: z.string().trim().min(1).max(255),
    counterparty: z.string().trim().max(255).nullable().optional(),
    type: z.enum(["PAY", "RECEIVE"]),
    amount: amountSchema,
    notes: z.string().trim().max(155).nullable().optional(),
});

export const updateCommitmentSchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    counterparty: z.string().trim().max(255).nullable().optional(),
    amount: amountSchema.optional(),
    notes: z.string().trim().max(155).nullable().optional(),
}).refine(data => Object.values(data).some(value => value !== undefined), {
    message: "At least one field is required",
});

export const settleCommitmentSchema = z.object({
    accountId: z.string().uuid(),
    amount: amountSchema,
    category: z.string().trim().min(1).max(100),
});

export const commitmentListQuerySchema = z.object({
    type: z.enum(["PAY", "RECEIVE"]).optional(),
});

export const commitmentIdSchema = z.string().uuid();

export type CreateCommitmentInput = z.infer<typeof createCommitmentSchema>;
export type UpdateCommitmentInput = z.infer<typeof updateCommitmentSchema>;
export type SettleCommitmentInput = z.infer<typeof settleCommitmentSchema>;
