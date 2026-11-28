import type { TransactionFilters } from "../../apis/transactionApis";

export const queryKeys = {
    accounts: (userId?: string) => ["accounts", userId] as const,

    transactionsRoot: (userId?: string) =>
        ["transactions", userId] as const,

    transactions: (filters: TransactionFilters, userId?: string) =>
        ["transactions", userId, filters] as const,

    transactionChartRoot: (userId?: string) =>
        ["transactionChart", userId] as const,

    transactionChart: (filters: TransactionFilters, userId?: string) =>
        ["transactionChart", userId, filters] as const,

    budget: (userId?: string) => ["budget", userId] as const,

    budgetByCategory: (userId?: string, category?: string) =>
        ["budget", userId, category] as const,

    expenseBreakdownRoot: (userId?: string) =>
        ["expenseBreakdown", userId] as const,

    expenseBreakdown: (month: string, userId?: string) =>
        ["expenseBreakdown", userId, month] as const,

    subscriptionsRoot: (userId?: string) =>
        ["subscriptions", userId] as const,

    subscriptions: (userId?: string) =>
        ["subscriptions", userId, "list"] as const,

    subscription: (subscriptionId: string, userId?: string) =>
        ["subscriptions", userId, "detail", subscriptionId] as const,

    commitments: (userId?: string) => ["commitments", userId] as const,

    commitment: (commitmentId: string, userId?: string) =>
        ["commitments", userId, "detail", commitmentId] as const,
    
    commitmentDetailsRoot: (userId?: string) =>
        ["commitments", userId, "detail"] as const,


};