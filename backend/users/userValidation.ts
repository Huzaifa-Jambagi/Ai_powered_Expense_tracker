import { z } from "zod";

export const onboardingSchema = z.object({
  startingBalance: z.number().finite().nonnegative(),
  currency: z.string().min(1),
});