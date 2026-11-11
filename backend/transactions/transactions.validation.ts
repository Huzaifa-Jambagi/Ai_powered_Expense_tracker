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