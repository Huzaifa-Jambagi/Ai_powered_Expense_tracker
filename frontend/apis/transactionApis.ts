import { api } from "./api";
import type { CategoryKey } from "../constants/catogories";

export type TransactionType = "INCOME" | "EXPENSE";

export type Transaction = {
    id: string;
    accountId: string;
    accountName: string;
    type: TransactionType;
    amount: string;
    category: CategoryKey;
    description: string | null;
    date: string;
    status: string;
    input_method: string;
    voice_transcript: string | null;
    is_flagged: boolean;
    flag_reason: string | null;
    created_at: string;
    updated_at: string;
};

export type DailyTransactionChart = {
    date: string;
    income: string;
    expense: string;
};

export type TransactionFilters = {
    month: string;
    type?: TransactionType;
    accountId?: string;
    limit?: number;
};

export type TransactionChartFilters = {
    month: string;
    type?: TransactionType;
    accountId?: string;
};

export type AddTransactionPayload = {
    accountId: string;
    type: TransactionType;
    amount: string;
    category: CategoryKey;
    description: string | null;
    date: string;
    input_method: "manual" | "scan" | "mic";
    voice_transcript: string | null;
};

type AddTransactionResponse = {
    success: boolean;
    message: string;
};

export const getTransactionsApi = async (filters: {
    month: string;
    type?: TransactionType;
    accountId?: string;
    limit?: number;
    offset?: number;
}) => {
    const { data } = await api.get<{
        success: boolean;
        data: {
            data: Transaction[];
            pagination: {
                limit: number;
                offset: number;
                hasMore: boolean;
                nextOffset: number | null;
            };
        };
    }>("/api/v1/transactions/get", { params: filters });

    return data.data;
};

export const getTransactionChartApi = async (filters: {
    month: string;
    type?: TransactionType;
    accountId?: string;
}) => {
    const { data } = await api.get<{
        success: boolean;
        data: DailyTransactionChart[];
    }>("/api/v1/transactions/chart", { params: filters });

    return data.data;
};

export type ExpenseBreakdown = {
    category: CategoryKey;
    amount: string;
};

export const getExpenseBreakdownApi = async (month: string): Promise<ExpenseBreakdown[]> => {
    const { data } = await api.get<{ success: boolean; data: ExpenseBreakdown[] }>(
        "/api/v1/transactions/expense-breakdown",
        { params: { month } }
    );

    return data.data;
};


export const addTransactionApi = async (payload: AddTransactionPayload): Promise<AddTransactionResponse> => {
    const { data } = await api.post<AddTransactionResponse>(
        "/api/v1/transactions/add",
        payload,
    );

    if (!data.success) throw new Error(data.message || "Transaction could not be saved.");

    return data;
};

export const deleteTransactionApi = async (id: string): Promise<AddTransactionResponse> => {
    const { data } = await api.delete<AddTransactionResponse>(`/api/v1/transactions/delete/${id}`);

    if (!data.success) throw new Error(data.message || "Transaction could not be deleted.");

    return data;
};

