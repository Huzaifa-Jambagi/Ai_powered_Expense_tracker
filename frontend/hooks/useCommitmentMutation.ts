import {
    useMutation,
    useQueryClient,
    useIsMutating,
    type InfiniteData,
    type QueryClient,
    type QueryKey,
} from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { Alert } from "react-native";

import {
    createCommitment as createCommitmentApi,
    updateCommitment as updateCommitmentApi,
    settleCommitment as settleCommitmentApi,
    deleteCommitment as deleteCommitmentApi,
} from "../apis/commitmentApi";

import type {
    Commitment,
    CommitmentTransaction,
    CommitmentSummary,
    GetCommitmentsResponse,
    GetCommitmentResponse,
    CreateCommitmentInput,
    UpdateCommitmentInput,
    SettleCommitmentInput,
} from "../apis/commitmentApi";

import {
    getTransactionsApi,
} from "../apis/transactionApis";

import type {
    Transaction,
    TransactionFilters,
    TransactionChartFilters,
    DailyTransactionChart,
    ExpenseBreakdown,
} from "../apis/transactionApis";

import type { Account } from "../apis/accountApis";
import { queryKeys } from "../lib/query/queryKeys";

type CommitmentMutationAction = "create" | "update" | "settle" | "delete";

type TransactionPage = Awaited<ReturnType<typeof getTransactionsApi>>;
type TransactionCache = InfiniteData<TransactionPage>;

type CacheSnapshot<T> = Array<[QueryKey, T | undefined]>;

type FinancialQueryKeys = {
    transactions: QueryKey;
    charts: QueryKey;
    breakdowns: QueryKey;
    accounts: QueryKey;
};

type FinancialSnapshots = {
    transactions: CacheSnapshot<TransactionCache>;
    charts: CacheSnapshot<DailyTransactionChart[]>;
    breakdowns: CacheSnapshot<ExpenseBreakdown[]>;
    accounts: CacheSnapshot<Account[]>;
};

type SettlementContext = FinancialSnapshots & {
    previousList?: GetCommitmentsResponse;
    previousDetail?: GetCommitmentResponse;
    keys: FinancialQueryKeys;
};

// Mutation keys

export const commitmentMutationRootKey = (userId?: string) =>
    ["commitmentMutations", userId] as const;

export const commitmentMutationKey = (action: CommitmentMutationAction, userId?: string) =>
    [...commitmentMutationRootKey(userId), action] as const;

export const useCommitmentMutationPending = (action: CommitmentMutationAction) => {
    const { user } = useUser();

    return useIsMutating({
        mutationKey: commitmentMutationKey(action, user?.id),
    }) > 0;
};

// Money helpers

const toCents = (value: string | number) => {
    const text = String(value);
    const negative = text.startsWith("-");
    const [whole, fraction = ""] = (negative ? text.slice(1) : text).split(".");
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

    return negative ? -cents : cents;
};

const fromCents = (value: number) => {
    const sign = value < 0 ? "-" : "";
    const absolute = Math.abs(value);

    return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
};

const getSummary = (items: Commitment[]): CommitmentSummary => {
    const summary = {
        toPay: { amount: 0, count: 0 },
        toReceive: { amount: 0, count: 0 },
    };

    for (const item of items) {
        const total = item.type === "PAY" ? summary.toPay : summary.toReceive;

        total.amount += toCents(item.remaining_amount);
        total.count++;
    }

    return {
        toPay: {
            amount: fromCents(summary.toPay.amount),
            count: summary.toPay.count,
        },
        toReceive: {
            amount: fromCents(summary.toReceive.amount),
            count: summary.toReceive.count,
        },
    };
};

const updateListCache = (previousData: GetCommitmentsResponse, items: Commitment[]): GetCommitmentsResponse => ({
    ...previousData,
    data: {
        ...previousData.data,
        commitments: items,
        summary: getSummary(items),
    },
});

const restoreCache = <T,>(queryClient: QueryClient, snapshots: CacheSnapshot<T>) => {
    for (const [key, data] of snapshots) {
        if (data !== undefined) queryClient.setQueryData<T>(key, data);
    }
};

// Query invalidation

const invalidateCommitmentQueries = (queryClient: QueryClient, userId?: string) => {
    void queryClient.invalidateQueries({
        queryKey: queryKeys.commitments(userId),
    });

    void queryClient.invalidateQueries({
        queryKey: queryKeys.commitmentDetailsRoot(userId),
    });
};

const getFinancialQueryKeys = (userId: string): FinancialQueryKeys => ({
    transactions: queryKeys.transactionsRoot(userId),
    charts: queryKeys.transactionChartRoot(userId),
    breakdowns: queryKeys.expenseBreakdownRoot(userId),
    accounts: queryKeys.accounts(userId),
});

const invalidateFinancialQueries = (queryClient: QueryClient, keys: FinancialQueryKeys) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.transactions }),
        queryClient.invalidateQueries({ queryKey: keys.charts }),
        queryClient.invalidateQueries({ queryKey: keys.breakdowns }),
        queryClient.invalidateQueries({ queryKey: keys.accounts }),
    ]);

// Optimistic transaction cache updates

const sortTransactions = (a: Transaction, b: Transaction) =>
    new Date(b.date).getTime() - new Date(a.date).getTime() ||
    b.id.localeCompare(a.id);

const updateTransactionCaches = (
    queryClient: QueryClient,
    snapshots: FinancialSnapshots,
    transaction: Transaction,
    month: string,
    day: string,
) => {
    const amountCents = toCents(transaction.amount);

    // Transaction lists

    for (const [key, cached] of snapshots.transactions) {
        const filters = key[2] as TransactionFilters | undefined;

        if (
            !cached?.pages.length ||
            !filters ||
            filters.month !== month ||
            (filters.type && filters.type !== transaction.type) ||
            (filters.accountId && filters.accountId !== transaction.accountId)
        ) {
            continue;
        }

        const allTransactions = [
            ...cached.pages.flatMap(page => page.data),
            transaction,
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

    // Daily charts

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
            cached.map(item =>
                item.date === day
                    ? {
                        ...item,
                        [amountKey]: fromCents(toCents(item[amountKey]) + amountCents),
                    }
                    : item,
            ),
        );
    }

    // Expense breakdown

    if (transaction.type === "EXPENSE") {
        for (const [key, cached] of snapshots.breakdowns) {
            if (!cached || key[2] !== month) continue;

            const existingCategory = cached.find(
                item => item.category === transaction.category,
            );

            const next = existingCategory
                ? cached.map(item =>
                    item.category === transaction.category
                        ? {
                            ...item,
                            amount: fromCents(toCents(item.amount) + amountCents),
                        }
                        : item,
                )
                : [
                    ...cached,
                    {
                        category: transaction.category,
                        amount: transaction.amount,
                    },
                ];

            next.sort((a, b) => toCents(b.amount) - toCents(a.amount));

            queryClient.setQueryData<ExpenseBreakdown[]>(key, next);
        }
    }

    // Account balances

    const balanceDelta = transaction.type === "INCOME" ? amountCents : -amountCents;

    for (const [key, cached] of snapshots.accounts) {
        if (!cached) continue;

        queryClient.setQueryData<Account[]>(
            key,
            cached.map(account =>
                account.id === transaction.accountId
                    ? {
                        ...account,
                        balance: fromCents(toCents(account.balance) + balanceDelta),
                    }
                    : account,
            ),
        );
    }
};

// CREATE

export const useCreateCommitmentMutation = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const queryKey = queryKeys.commitments(user?.id);
    const mutationKey = commitmentMutationKey("create", user?.id);

    return useMutation({
        mutationKey,
        mutationFn: createCommitmentApi,

        onMutate: async input => {
            if (!user?.id) return undefined;

            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<GetCommitmentsResponse>(queryKey);

            const currentData = previousData ?? {
                success: true,
                data: {
                    commitments: [],
                    summary: {
                        toPay: { amount: "0.00", count: 0 },
                        toReceive: { amount: "0.00", count: 0 },
                    },
                },
                message: "",
            };

            const now = new Date().toISOString();

            const optimisticCommitment: Commitment = {
                id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                user_id: user.id,
                name: input.name,
                counterparty: input.counterparty ?? null,
                type: input.type,
                amount: fromCents(toCents(input.amount)),
                settled_amount: "0.00",
                notes: input.notes ?? null,
                created_at: now,
                updated_at: now,
                remaining_amount: fromCents(toCents(input.amount)),
                settlement_status: "PENDING",
            };

            queryClient.setQueryData<GetCommitmentsResponse>(
                queryKey,
                updateListCache(currentData, [
                    optimisticCommitment,
                    ...currentData.data.commitments,
                ]),
            );

            return { previousData };
        },

        onError: (error, _input, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            } else {
                queryClient.removeQueries({ queryKey, exact: true });
            }

            Alert.alert("Commitment Creation Failed", "The optimistic commitment has been removed. Please try again.");
            console.error("Commitment creation failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey: commitmentMutationRootKey(user?.id) }) === 1) {
                invalidateCommitmentQueries(queryClient, user?.id);
            }
        },
    });
};

// UPDATE

export const useUpdateCommitmentMutation = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const listKey = queryKeys.commitments(user?.id);
    const mutationKey = commitmentMutationKey("update", user?.id);

    return useMutation({
        mutationKey,

        mutationFn: ({ commitmentId, data }: {
            commitmentId: string;
            data: UpdateCommitmentInput;
        }) => updateCommitmentApi(commitmentId, data),

        onMutate: async ({ commitmentId, data }) => {
            if (!user?.id) return undefined;

            const detailKey = queryKeys.commitment(commitmentId, user.id);

            await Promise.all([
                queryClient.cancelQueries({ queryKey: listKey }),
                queryClient.cancelQueries({ queryKey: detailKey }),
            ]);

            const previousList = queryClient.getQueryData<GetCommitmentsResponse>(listKey);
            const previousDetail = queryClient.getQueryData<GetCommitmentResponse>(detailKey);

            const updateOptimistically = (commitment: Commitment): Commitment => {
                const amount = data.amount === undefined
                    ? commitment.amount
                    : fromCents(toCents(data.amount));

                const amountCents = toCents(amount);
                const settledCents = toCents(commitment.settled_amount);

                if (amountCents < settledCents) return commitment;

                const remaining = amountCents - settledCents;

                return {
                    ...commitment,
                    name: data.name ?? commitment.name,
                    counterparty: data.counterparty === undefined ? commitment.counterparty : data.counterparty,
                    amount,
                    notes: data.notes === undefined ? commitment.notes : data.notes,
                    updated_at: new Date().toISOString(),
                    remaining_amount: fromCents(remaining),
                    settlement_status: remaining === 0 ? "SETTLED" : settledCents === 0 ? "PENDING" : "PARTIAL",
                };
            };

            if (previousList) {
                const items = previousList.data.commitments
                    .map(item => item.id === commitmentId ? updateOptimistically(item) : item)
                    .filter(item => toCents(item.remaining_amount) > 0);

                queryClient.setQueryData<GetCommitmentsResponse>(
                    listKey,
                    updateListCache(previousList, items),
                );
            }

            if (previousDetail) {
                queryClient.setQueryData<GetCommitmentResponse>(detailKey, {
                    ...previousDetail,
                    data: {
                        ...updateOptimistically(previousDetail.data),
                        transactions: previousDetail.data.transactions,
                    },
                });
            }

            return { previousList, previousDetail };
        },

        onError: (error, { commitmentId }, context) => {
            const detailKey = queryKeys.commitment(commitmentId, user?.id);

            if (context?.previousList) {
                queryClient.setQueryData(listKey, context.previousList);
            }

            if (context?.previousDetail) {
                queryClient.setQueryData(detailKey, context.previousDetail);
            }

            Alert.alert("Commitment Update Failed", "Your previous commitment details have been restored. Please try again.");
            console.error("Commitment update failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey: commitmentMutationRootKey(user?.id) }) === 1) {
                invalidateCommitmentQueries(queryClient, user?.id);
            }
        },
    });
};

// SETTLE

export const useSettleCommitmentMutation = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const listKey = queryKeys.commitments(user?.id);
    const mutationKey = commitmentMutationKey("settle", user?.id);

    return useMutation({
        mutationKey,

        mutationFn: ({ commitmentId, data }: {
            commitmentId: string;
            data: SettleCommitmentInput;
        }) => settleCommitmentApi(commitmentId, data),

        onMutate: async ({ commitmentId, data }): Promise<SettlementContext | undefined> => {
            if (!user?.id) return undefined;

            const detailKey = queryKeys.commitment(commitmentId, user.id);
            const keys = getFinancialQueryKeys(user.id);

            await Promise.all([
                queryClient.cancelQueries({ queryKey: listKey }),
                queryClient.cancelQueries({ queryKey: detailKey }),
                queryClient.cancelQueries({ queryKey: keys.transactions }),
                queryClient.cancelQueries({ queryKey: keys.charts }),
                queryClient.cancelQueries({ queryKey: keys.breakdowns }),
                queryClient.cancelQueries({ queryKey: keys.accounts }),
            ]);

            const previousList = queryClient.getQueryData<GetCommitmentsResponse>(listKey);
            const previousDetail = queryClient.getQueryData<GetCommitmentResponse>(detailKey);

            const snapshots: FinancialSnapshots = {
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

            const context: SettlementContext = {
                previousList,
                previousDetail,
                keys,
                ...snapshots,
            };

            const commitment = previousDetail?.data ??
                previousList?.data.commitments.find(item => item.id === commitmentId);

            if (!commitment) return context;

            const settlementCents = toCents(data.amount);
            const settledCents = toCents(commitment.settled_amount);
            const amountCents = toCents(commitment.amount);
            const remaining = amountCents - settledCents;

            // Don't optimistically apply an invalid settlement.
            if (settlementCents <= 0 || settlementCents > remaining) return context;

            const nowDate = new Date();
            const now = nowDate.toISOString();
            const month = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}`;
            const day = `${month}-${String(nowDate.getDate()).padStart(2, "0")}`;

            const newSettled = settledCents + settlementCents;
            const newRemaining = amountCents - newSettled;
            const transactionType = commitment.type === "PAY" ? "EXPENSE" : "INCOME";
            const account = snapshots.accounts
                .flatMap(([, accounts]) => accounts ?? [])
                .find(item => item.id === data.accountId);

            const updatedCommitment: Commitment = {
                ...commitment,
                settled_amount: fromCents(newSettled),
                remaining_amount: fromCents(newRemaining),
                updated_at: now,
                settlement_status: newRemaining === 0 ? "SETTLED" : "PARTIAL",
            };

            const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const description = `${commitment.name}${commitment.counterparty ? ` · ${commitment.counterparty}` : ""}`.slice(0, 255);
            const amount = fromCents(settlementCents);

            // Transaction shape used by the commitment detail endpoint.
            const optimisticCommitmentTransaction: CommitmentTransaction = {
                id: optimisticId,
                user_id: user.id,
                account_id: data.accountId,
                commitment_id: commitmentId,
                type: transactionType,
                amount,
                category: data.category,
                description,
                date: now,
                status: "COMPLETED",
                input_method: "manual",
                voice_transcript: null,
                is_flagged: false,
                flag_reason: null,
                created_at: now,
                updated_at: now,
            };

            // Transaction shape used by the transaction list cache.
            const optimisticTransaction: Transaction = {
                id: optimisticId,
                accountId: data.accountId,
                accountName: account?.name ?? "",
                type: transactionType,
                amount,
                category: data.category,
                description,
                date: now,
                status: "COMPLETED",
                input_method: "manual",
                voice_transcript: null,
                is_flagged: false,
                flag_reason: null,
                created_at: now,
                updated_at: now,
            };

            // Commitment list and summary.
            if (previousList) {
                const items = previousList.data.commitments
                    .map(item => item.id === commitmentId ? updatedCommitment : item)
                    .filter(item => toCents(item.remaining_amount) > 0);

                queryClient.setQueryData<GetCommitmentsResponse>(
                    listKey,
                    updateListCache(previousList, items),
                );
            }

            // Commitment details and settlement history.
            if (previousDetail) {
                queryClient.setQueryData<GetCommitmentResponse>(detailKey, {
                    ...previousDetail,
                    data: {
                        ...updatedCommitment,
                        transactions: [
                            optimisticCommitmentTransaction,
                            ...previousDetail.data.transactions,
                        ],
                    },
                });
            }

            // Transaction lists, charts, expense breakdown and account balances.
            updateTransactionCaches(
                queryClient,
                snapshots,
                optimisticTransaction,
                month,
                day,
            );

            return context;
        },

        onError: (error, { commitmentId }, context) => {
            if (context) {
                if (context.previousList) {
                    queryClient.setQueryData(listKey, context.previousList);
                }

                if (context.previousDetail) {
                    queryClient.setQueryData(
                        queryKeys.commitment(commitmentId, user?.id),
                        context.previousDetail,
                    );
                }

                restoreCache(queryClient, context.transactions);
                restoreCache(queryClient, context.charts);
                restoreCache(queryClient, context.breakdowns);
                restoreCache(queryClient, context.accounts);
            }

            Alert.alert("Settlement Failed", "Your commitment, settlement history, transaction lists, charts, expense breakdown and account balance have been restored. Please try again.");
            console.error("Commitment settlement failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey: commitmentMutationRootKey(user?.id) }) === 1) {
                invalidateCommitmentQueries(queryClient, user?.id);
            }

            if (queryClient.isMutating({ mutationKey }) === 1 && user?.id) {
                void invalidateFinancialQueries(queryClient, getFinancialQueryKeys(user.id));
            }
        },
    });
};

// DELETE

export const useDeleteCommitmentMutation = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const listKey = queryKeys.commitments(user?.id);
    const mutationKey = commitmentMutationKey("delete", user?.id);

    return useMutation({
        mutationKey,
        mutationFn: deleteCommitmentApi,

        onMutate: async commitmentId => {
            if (!user?.id) return undefined;

            const detailKey = queryKeys.commitment(commitmentId, user.id);

            await Promise.all([
                queryClient.cancelQueries({ queryKey: listKey }),
                queryClient.cancelQueries({ queryKey: detailKey }),
            ]);

            const previousList = queryClient.getQueryData<GetCommitmentsResponse>(listKey);
            const previousDetail = queryClient.getQueryData<GetCommitmentResponse>(detailKey);

            if (previousList) {
                const items = previousList.data.commitments.filter(item => item.id !== commitmentId);

                queryClient.setQueryData<GetCommitmentsResponse>(
                    listKey,
                    updateListCache(previousList, items),
                );
            }

            queryClient.removeQueries({ queryKey: detailKey, exact: true });

            return { previousList, previousDetail };
        },

        onError: (error, commitmentId, context) => {
            if (context?.previousList) {
                queryClient.setQueryData(listKey, context.previousList);
            }

            if (context?.previousDetail) {
                queryClient.setQueryData(
                    queryKeys.commitment(commitmentId, user?.id),
                    context.previousDetail,
                );
            }

            Alert.alert("Commitment Deletion Failed", "Your commitment has been restored. Please try again.");
            console.error("Commitment deletion failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey: commitmentMutationRootKey(user?.id) }) === 1) {
                invalidateCommitmentQueries(queryClient, user?.id);
            }
        },
    });
};
