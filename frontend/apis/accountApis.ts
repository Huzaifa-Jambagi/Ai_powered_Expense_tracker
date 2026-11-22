import { api } from "./api";

export type AccountType = "CASH" | "BANK" | "CREDIT_CARD" | "OTHER";

export type Account = {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    balance: string;
    is_default: boolean;
    created_at: string;
};

export type CreateAccountInput = {
    name: string;
    type: AccountType;
    openingBalance: string;
};

export type UpdateAccountInput = {
    name?: string;
    type?: AccountType;
    balance?: string;
};

export const getAccount = async (): Promise<Account[]> => {
    const { data } = await api.get<{ data: Account[] }>("/api/v1/accounts/get");
    return data.data;
};

export const createAccount = async (input: CreateAccountInput): Promise<Account> => {
    const { data } = await api.post<{ data: Account }>("/api/v1/accounts/create", {
        name: input.name,
        type: input.type,
        opening_balance: input.openingBalance,
    });

    return data.data;
};

export const updateAccount = async (accountId: string, input: UpdateAccountInput): Promise<Account> => {
    const { data } = await api.patch<{ data: Account }>(`/api/v1/accounts/${accountId}`, input);
    return data.data;
};

export const deleteAccount = async (accountId: string): Promise<string> => {
    const { data } = await api.delete<{ data: { id: string } }>(`/api/v1/accounts/${accountId}`);
    return data.data.id;
};