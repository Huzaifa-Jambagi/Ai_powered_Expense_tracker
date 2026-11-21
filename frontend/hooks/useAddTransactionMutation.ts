import {
    useMutation,
    useQueryClient,
    type InfiniteData,
    type QueryClient,
    type QueryKey,
} from "@tanstack/react-query";
import { useUser } from "@clerk/expo";

import { Alert } from "react-native";
import { getCategoryConfig } from "../constants/catogories";
import {
    addTransactionApi,
    deleteTransactionApi,
    getTransactionsApi,
} from "../apis/transactionApis";

import type {
    AddTransactionPayload,
    Transaction,
    TransactionFilters,
    TransactionChartFilters,
    DailyTransactionChart,
    ExpenseBreakdown,
} from "../apis/transactionApis";

import type { Account } from "../apis/accountApis";
import { queryKeys } from "../lib/query/queryKeys";

type TransactionPage = Awaited<ReturnType<typeof getTransactionsApi>>;
type TransactionCache = InfiniteData<TransactionPage>;

type CacheSnapshot<T> = Array<[QueryKey, T | undefined]>;

type MutationQueryKeys = {
    transactions: QueryKey;
    charts: QueryKey;
    breakdowns: QueryKey;
    accounts: QueryKey;
    budgets: QueryKey;
};

type MutationContext = {
    keys: MutationQueryKeys;
    transactions: CacheSnapshot<TransactionCache>;
    charts: CacheSnapshot<DailyTransactionChart[]>;
    breakdowns: CacheSnapshot<ExpenseBreakdown[]>;
    accounts: CacheSnapshot<Account[]>;
};

const addAmounts = (current: string, amount: string) =>
    (Number(current) + Number(amount)).toFixed(2);

const subtractAmounts = (current: string, amount: string) =>
    (Number(current) - Number(amount)).toFixed(2);

const sortTransactions = (a: Transaction, b: Transaction) =>
    new Date(b.date).getTime() - new Date(a.date).getTime() ||
    b.id.localeCompare(a.id);

const restoreCache = <T,>(queryClient: QueryClient, snapshots: CacheSnapshot<T>) => {
    for (const [key, data] of snapshots) {
        if (data !== undefined) queryClient.setQueryData<T>(key, data);
    }
};

type DeleteTransactionVariables = {
    transaction: Transaction;
    currencySymbol: string;
    onOptimisticUpdate: () => void;
};

type AddTransactionVariables = {
    payload: AddTransactionPayload;
    currencySymbol: string;
    onOptimisticUpdate: () => void;
};

const invalidateTransactionQueries = (queryClient: QueryClient, keys: MutationQueryKeys) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.transactions }),
        queryClient.invalidateQueries({ queryKey: keys.charts }),
        queryClient.invalidateQueries({ queryKey: keys.breakdowns }),
        queryClient.invalidateQueries({ queryKey: keys.accounts }),
        queryClient.invalidateQueries({ queryKey: keys.budgets }),
    ]);

export const useAddTransactionMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const userId = user?.id;

   return useMutation({
    mutationFn: ({ payload }: AddTransactionVariables) => addTransactionApi(payload),

    onMutate: async ({ payload, onOptimisticUpdate }): Promise<MutationContext | undefined> => {
            if (!userId) return undefined;

            const keys: MutationQueryKeys = {
                transactions: queryKeys.transactionsRoot(userId),
                charts: ["transactionChart", userId],
                breakdowns: ["expenseBreakdown", userId],
                accounts: queryKeys.accounts(userId),
                budgets: queryKeys.budget(userId),
            };

            // Cancel pending refetches so they cannot overwrite optimistic changes.
            await Promise.all([
                queryClient.cancelQueries({ queryKey: keys.transactions }),
                queryClient.cancelQueries({ queryKey: keys.charts }),
                queryClient.cancelQueries({ queryKey: keys.breakdowns }),
                queryClient.cancelQueries({ queryKey: keys.accounts }),
            ]);

            // Snapshot every matching cache entry before updating anything.
            const snapshots = {
                transactions: queryClient.getQueriesData<TransactionCache>({
                    queryKey: keys.transactions,
                }),
                charts: queryClient.getQueriesData<DailyTransactionChart[]>({
                    queryKey: keys.charts,
                }),
                breakdowns: queryClient.getQueriesData<ExpenseBreakdown[]>({
                    queryKey: keys.breakdowns,
                }),
                accounts: queryClient.getQueriesData<Account[]>({
                    queryKey: keys.accounts,
                }),
            };

            const selectedAccount = snapshots.accounts
                .flatMap(([, accounts]) => accounts ?? [])
                .find((account) => account.id === payload.accountId);

            const amount = Number(payload.amount);
            const balanceDelta = payload.type === "INCOME" ? amount : -amount;

            const transactionDate = new Date(payload.date);
            const month = `${transactionDate.getFullYear()}-${String(
                transactionDate.getMonth() + 1,
            ).padStart(2, "0")}`;
            const day = `${month}-${String(transactionDate.getDate()).padStart(2, "0")}`;

            const now = new Date().toISOString();

            const optimisticTransaction: Transaction = {
                id: `optimistic-${Date.now()}`,
                accountId: payload.accountId,
                accountName: selectedAccount?.name ?? "",
                type: payload.type,
                amount: payload.amount,
                category: payload.category,
                description: payload.description,
                date: payload.date,
                status: "COMPLETED",
                input_method: payload.input_method,
                voice_transcript: payload.voice_transcript,
                is_flagged: false,
                flag_reason: null,
                created_at: now,
                updated_at: now,
            };

            // Update matching transaction lists.
            for (const [key, cached] of snapshots.transactions) {
                const filters = key[2] as TransactionFilters | undefined;

                if (
                    !cached?.pages.length ||
                    !filters ||
                    filters.month !== month ||
                    (filters.type && filters.type !== payload.type) ||
                    (filters.accountId && filters.accountId !== payload.accountId)
                ) {
                    continue;
                }

                const allTransactions = [
                    ...cached.pages.flatMap((page) => page.data),
                    optimisticTransaction,
                ].sort(sortTransactions);

                let offset = 0;
                const lastPageIndex = cached.pages.length - 1;

                const pages = cached.pages.map((page, index) => {
                    const pageSize = page.data.length + (index === lastPageIndex ? 1 : 0);
                    const data = allTransactions.slice(offset, offset + pageSize);

                    offset += pageSize;

                    return { ...page, data };
                });

                queryClient.setQueryData<TransactionCache>(key, {
                    ...cached,
                    pages,
                });
            }

            // Update the matching chart day.
            const amountKey = payload.type === "INCOME" ? "income" : "expense";

            for (const [key, cached] of snapshots.charts) {
                const filters = key[2] as TransactionChartFilters | undefined;

                if (
                    !cached ||
                    !filters ||
                    filters.month !== month ||
                    (filters.type && filters.type !== payload.type) ||
                    (filters.accountId && filters.accountId !== payload.accountId)
                ) {
                    continue;
                }

                queryClient.setQueryData<DailyTransactionChart[]>(
                    key,
                    cached.map((item) =>
                        item.date === day
                            ? {
                                ...item,
                                [amountKey]: addAmounts(item[amountKey], payload.amount),
                            }
                            : item,
                    ),
                );
            }

            // Update the expense category total.
            if (payload.type === "EXPENSE") {
                for (const [key, cached] of snapshots.breakdowns) {
                    if (!cached || key[2] !== month) continue;

                    const existingCategory = cached.find(
                        (item) => item.category === payload.category,
                    );

                    const next = existingCategory
                        ? cached.map((item) =>
                            item.category === payload.category
                                ? {
                                    ...item,
                                    amount: addAmounts(item.amount, payload.amount),
                                }
                                : item,
                        )
                        : [
                            ...cached,
                            { category: payload.category, amount: payload.amount },
                        ];

                    next.sort((a, b) => Number(b.amount) - Number(a.amount));

                    queryClient.setQueryData<ExpenseBreakdown[]>(key, next);
                }
            }

            // Update the selected account balance.
            for (const [key, cached] of snapshots.accounts) {
                if (!cached) continue;

                queryClient.setQueryData<Account[]>(
                    key,
                    cached.map((account) =>
                        account.id === payload.accountId
                            ? {
                                ...account,
                                balance: (Number(account.balance) + balanceDelta).toFixed(2),
                            }
                            : account,
                    ),
                );
            }

            onOptimisticUpdate();

            return { keys, ...snapshots };
        },

        // Restore the exact previous cache values if the request fails.
        onError: (error, { payload, currencySymbol }, context) => {
            if (context) {
                restoreCache(queryClient, context.transactions);
                restoreCache(queryClient, context.charts);
                restoreCache(queryClient, context.breakdowns);
                restoreCache(queryClient, context.accounts);

                void invalidateTransactionQueries(queryClient, context.keys);
            }

            const transactionName = payload.description?.trim()
                || getCategoryConfig(payload.category).label;

            const amount = Number(payload.amount).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
            });

            Alert.alert(
                "Transaction not saved",
                `${transactionName} · ${currencySymbol}${amount} couldn't be saved. Your transaction lists and account balance have been restored.\n\n${error.message}`,
            );
        },

        // Keep optimistic values and reconcile with server data after success.
        onSuccess: (_data, _payload, context) => {
            if (!context) return;

            // Do not make the mutation wait for refetching.
            void invalidateTransactionQueries(queryClient, context.keys);
        },
    });
};


export const useDeleteTransactionMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const userId = user?.id;

    return useMutation({
        mutationFn: ({ transaction }: DeleteTransactionVariables) => deleteTransactionApi(transaction.id),

        onMutate: async ({ transaction, onOptimisticUpdate }): Promise<MutationContext | undefined> => {
            if (!userId) return undefined;

            const keys: MutationQueryKeys = {
                transactions: queryKeys.transactionsRoot(userId),
                charts: ["transactionChart", userId],
                breakdowns: ["expenseBreakdown", userId],
                accounts: queryKeys.accounts(userId),
                budgets: queryKeys.budget(userId),
            };

            await Promise.all([
                queryClient.cancelQueries({ queryKey: keys.transactions }),
                queryClient.cancelQueries({ queryKey: keys.charts }),
                queryClient.cancelQueries({ queryKey: keys.breakdowns }),
                queryClient.cancelQueries({ queryKey: keys.accounts }),
            ]);

            const snapshots = {
                transactions: queryClient.getQueriesData<TransactionCache>({
                    queryKey: keys.transactions,
                }),
                charts: queryClient.getQueriesData<DailyTransactionChart[]>({
                    queryKey: keys.charts,
                }),
                breakdowns: queryClient.getQueriesData<ExpenseBreakdown[]>({
                    queryKey: keys.breakdowns,
                }),
                accounts: queryClient.getQueriesData<Account[]>({
                    queryKey: keys.accounts,
                }),
            };

            const amount = Number(transaction.amount);
            const transactionDate = new Date(transaction.date);

            const dateIsValid = !Number.isNaN(transactionDate.getTime());

            const month = dateIsValid
                ? `${transactionDate.getFullYear()}-${String(
                    transactionDate.getMonth() + 1,
                ).padStart(2, "0")}`
                : "";

            const day = dateIsValid
                ? `${month}-${String(transactionDate.getDate()).padStart(2, "0")}`
                : "";

            // Remove from all matching cached transaction lists.
            for (const [key, cached] of snapshots.transactions) {
                if (!cached?.pages.length) continue;

                queryClient.setQueryData<TransactionCache>(key, {
                    ...cached,
                    pages: cached.pages.map((page) => ({
                        ...page,
                        data: page.data.filter((item) => item.id !== transaction.id),
                    })),
                });
            }

            // Reverse the corresponding daily chart amount.
            if (dateIsValid) {
                const amountKey = transaction.type === "INCOME" ? "income" : "expense";

                for (const [key, cached] of snapshots.charts) {
                    const filters = key[2] as TransactionChartFilters | undefined;

                    if (
                        !cached ||
                        !filters ||
                        filters.month !== month ||
                        (filters.type && filters.type !== transaction.type) ||
                        (filters.accountId && filters.accountId !== transaction.accountId)
                    ) {
                        continue;
                    }

                    queryClient.setQueryData<DailyTransactionChart[]>(
                        key,
                        cached.map((item) =>
                            item.date === day
                                ? {
                                    ...item,
                                    [amountKey]: subtractAmounts(item[amountKey], transaction.amount),
                                }
                                : item,
                        ),
                    );
                }
            }

            // Reverse the expense category total.
            if (transaction.type === "EXPENSE" && dateIsValid) {
                for (const [key, cached] of snapshots.breakdowns) {
                    if (!cached || key[2] !== month) continue;

                    const existingCategory = cached.find(
                        (item) => item.category === transaction.category,
                    );

                    if (!existingCategory) continue;

                    const remainingAmount = Number(existingCategory.amount) - amount;

                    const next = remainingAmount <= 0
                        ? cached.filter((item) => item.category !== transaction.category)
                        : cached.map((item) =>
                            item.category === transaction.category
                                ? {
                                    ...item,
                                    amount: remainingAmount.toFixed(2),
                                }
                                : item,
                        );

                    next.sort((a, b) => Number(b.amount) - Number(a.amount));

                    queryClient.setQueryData<ExpenseBreakdown[]>(key, next);
                }
            }

            // Reverse the transaction's effect on the account balance.
            const balanceDelta = transaction.type === "INCOME" ? -amount : amount;

            for (const [key, cached] of snapshots.accounts) {
                if (!cached) continue;

                queryClient.setQueryData<Account[]>(
                    key,
                    cached.map((account) =>
                        account.id === transaction.accountId
                            ? {
                                ...account,
                                balance: (Number(account.balance) + balanceDelta).toFixed(2),
                            }
                            : account,
                    ),
                );
            }

            onOptimisticUpdate();

            return { keys, ...snapshots };
        },

        // Restore previous cache data if deletion fails.
        onError: (error, { transaction, currencySymbol }, context) => {
            if (context) {
                restoreCache(queryClient, context.transactions);
                restoreCache(queryClient, context.charts);
                restoreCache(queryClient, context.breakdowns);
                restoreCache(queryClient, context.accounts);

                void invalidateTransactionQueries(queryClient, context.keys);
            }

            const transactionName = transaction.description?.trim()
                || getCategoryConfig(transaction.category).label;

            const amount = Number(transaction.amount).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
            });

            Alert.alert(
                "Transaction restored",
                `${transactionName} · ${currencySymbol}${amount} couldn't be deleted and has been restored to your transactions.\n\n${error.message}`,
            );
        },

        // Reconcile optimistic changes with the server.
        onSuccess: (_data, _transaction, context) => {
            if (!context) return;

            void invalidateTransactionQueries(queryClient, context.keys);
        },
    });
};