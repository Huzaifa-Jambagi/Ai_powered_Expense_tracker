import { z } from "zod";

const billingUnitSchema = z.enum(["DAY", "WEEK", "MONTH", "YEAR"]);

const subscriptionStatusSchema = z.enum(["ACTIVE", "PAUSED"]);

const amountSchema = z.string()
    .trim()
    .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, "Invalid amount")
    .refine(value => Number(value) > 0, "Amount must be greater than zero");

const billingIntervalSchema = z.coerce.number()
    .int("Billing interval must be a whole number")
    .positive("Billing interval must be greater than zero")
    .max(2147483647);

const dateSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(value => {
        const [year, month, day] = value.split("-").map(Number);

        if (year < 1 || month < 1 || month > 12) return false;

        const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return day >= 1 && day <= daysInMonth[month - 1];
    }, "Invalid calendar date");

export const createSubscriptionSchema = z.object({
    name: z.string().trim().min(1, "Subscription name is required").max(255),

    amount: amountSchema,

    billingInterval: billingIntervalSchema.default(1),

    billingUnit: billingUnitSchema.default("MONTH"),

    nextBillingDate: dateSchema,
});

export const updateSubscriptionSchema = createSubscriptionSchema
    .partial()
    .refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const updateSubscriptionStatusSchema = z.object({
    status: subscriptionStatusSchema,
});

export const subscriptionIdParamsSchema = z.object({
    subscriptionId: z.string().uuid("Invalid subscription ID"),
});

export const markSubscriptionPaidSchema = z.object({
    accountId: z.string().uuid("Invalid account ID"),
});

export type MarkSubscriptionPaidInput = z.infer<typeof markSubscriptionPaidSchema>;

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type UpdateSubscriptionStatusInput = z.infer<typeof updateSubscriptionStatusSchema>;