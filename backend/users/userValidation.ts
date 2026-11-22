import { z } from "zod";

export const onboardingSchema = z.object({
  startingBalance: z.number().finite().nonnegative(),
  currency: z.string().min(1),
});

export const updateCurrencySchema = z.object({
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Invalid currency code"),
});