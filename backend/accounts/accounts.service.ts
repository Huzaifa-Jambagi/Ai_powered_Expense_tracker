import * as accountRepository from "./accounts.repository.js";

export const getAccounts = async (clerkId: string) => {
  return await accountRepository.getAccounts(clerkId);
};