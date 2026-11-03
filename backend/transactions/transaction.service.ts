import * as transactionRepository from "./transaction.repository.js";

export const getTransactions = async (clerkId: string, type?: "INCOME" | "EXPENSE", accountId?: string) => {
  return await transactionRepository.getTransactions(clerkId, type, accountId);
};