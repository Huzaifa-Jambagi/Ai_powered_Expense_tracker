import { api } from "./api";
import { CategoryKey } from "../constants/catogories";

export type TransactionType = "INCOME" | "EXPENSE";
export type InputMethod = "MANUAL" | "RECEIPT_SCAN" | "VOICE";

export type Transaction = {
    id: string;
    user_id: string;
    account_id: string;
    type: TransactionType;
    amount: number;
    category: CategoryKey;
    description: string | null;
    date: string;
    status: string;
    input_method: InputMethod;
    voice_transcript: string | null;
    is_flagged: boolean;
    flag_reason: string | null;
    created_at: string;
    updated_at: string;
};

export type TransactionFilters = {
    type?: TransactionType | null;
    accountId?: string | null;
};

export const getTransactionsApi = async (filters: TransactionFilters = {}): Promise<Transaction[]> => {
    const { data } = await api.get<{ data: Transaction[] }>("/api/v1/transactions/get", {
        params: {
            type: filters.type ?? undefined,
            accountId: filters.accountId ?? undefined,
        },
    });
    console.log("transaction fetched",data.data)

    return data.data;
};