import * as accountRepository from "./accounts.repository.js";
import type { CreateAccountInput } from "./accounts.validation.js";

export const getAccounts = async (clerkId: string) => {
    return accountRepository.getAccounts(clerkId);
};

export const createAccount = async (clerkId: string, input: CreateAccountInput) => {
    return accountRepository.createAccount(clerkId, input);
};

import type { UpdateAccountInput } from "./accounts.validation.js";

export const updateAccount = async (clerkId: string, accountId: string, input: UpdateAccountInput) => {
    return accountRepository.updateAccount(clerkId, accountId, input);
};

export const deleteAccount = async (clerkId: string, accountId: string) => {
    return accountRepository.deleteAccount(clerkId, accountId);
};