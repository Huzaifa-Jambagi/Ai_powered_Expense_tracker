import * as budgetRepository from "./budget.repository.js";

export const getBudget = async (clerkId: string) => {
  return await budgetRepository.getBudget(clerkId);
};

export const setBudget = async (clerkId: string, amount: number) => {
  return await budgetRepository.setBudget(clerkId, amount);
};