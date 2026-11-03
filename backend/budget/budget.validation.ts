import { z } from "zod";


export const setBudgetSchema = z.object({
  amount: z.number().positive(),
});