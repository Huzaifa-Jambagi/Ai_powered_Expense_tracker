import { z } from "zod";
import cc from "currency-codes";

const validCurrencyCodes = cc.codes();

export const onboardingSchema = z.object({
  startingBalance: z
    .string()
    .min(0, "Please enter a starting balance.")
    .refine((v) => {
      const parsed = parseFloat(v.replace(/,/g, ""));
      return !Number.isNaN(parsed) && parsed > 0;
    }, "Please enter a valid starting balance."),

  currency: z
    .string()
    .min(1, "Please select a currency.")
    .refine(
      (value) => validCurrencyCodes.includes(value),
      "Please select a valid currency.",
    ),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;