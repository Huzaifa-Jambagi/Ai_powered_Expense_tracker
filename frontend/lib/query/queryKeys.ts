import type { TransactionFilters } from "../../apis/transactionApis";

export const queryKeys = {
    accounts: (userId?: string) => ["accounts", userId] as const,

    transactions: (filters: TransactionFilters, userId?: string) =>
        ["transactions", userId, filters] as const,

    transactionChart: (filters: TransactionFilters, userId?: string) =>
        ["transactionChart", userId, filters] as const,

    budget: (userId?: string) => ["budget", userId] as const,

    budgetByCategory: (userId?: string, category?: string) =>
        ["budget", userId, category] as const,

    expenseBreakdown: (month: string, userId?: string) =>
    ["expenseBreakdown", userId, month] as const,
};