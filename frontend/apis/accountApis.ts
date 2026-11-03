import { api } from "./api";

type AccountType = "CASH" | "BANK" | "CREDIT_CARD" | "SAVINGS";

export type Account = {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    balance: number;
    is_default: boolean;
    created_at: string;
};

export const getAccount = async (): Promise<Account[]> => {
    const { data } = await api.get<{ data: Account[] }>("/api/v1/accounts/get");
    return data.data;
};