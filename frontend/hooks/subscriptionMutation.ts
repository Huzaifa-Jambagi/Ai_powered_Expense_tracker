import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createSubscription,
    updateSubscription,
    updateSubscriptionStatus,
    deleteSubscription,
    markSubscriptionAsPaid,
    type SubscriptionInput,
    type UpdateSubscriptionInput,
    type SubscriptionStatus,
} from "../apis/subscriptionApi"
import { queryKeys } from "../lib/query/queryKeys";

export const useCreateSubscriptionMutation = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SubscriptionInput) => createSubscription(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKeys.subscriptionsRoot(userId),
        }),
    });
};

export const useUpdateSubscriptionMutation = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ subscriptionId, data }: {
            subscriptionId: string;
            data: UpdateSubscriptionInput;
        }) => updateSubscription(subscriptionId, data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKeys.subscriptionsRoot(userId),
        }),
    });
};

export const useUpdateSubscriptionStatusMutation = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ subscriptionId, status }: {
            subscriptionId: string;
            status: SubscriptionStatus;
        }) => updateSubscriptionStatus(subscriptionId, status),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKeys.subscriptionsRoot(userId),
        }),
    });
};

export const useDeleteSubscriptionMutation = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (subscriptionId: string) => deleteSubscription(subscriptionId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKeys.subscriptionsRoot(userId),
        }),
    });
};

export const useMarkSubscriptionAsPaidMutation = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ subscriptionId, accountId }: {
            subscriptionId: string;
            accountId: string;
        }) => markSubscriptionAsPaid(subscriptionId, accountId),

        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: queryKeys.subscriptionsRoot(userId),
            }),
            queryClient.invalidateQueries({
                queryKey: queryKeys.accounts(userId),
            }),
            queryClient.invalidateQueries({
                queryKey: queryKeys.transactionsRoot(userId),
            }),
            queryClient.invalidateQueries({
                queryKey: queryKeys.transactionChartRoot(userId),
            }),
            queryClient.invalidateQueries({
                queryKey: queryKeys.expenseBreakdownRoot(userId),
            }),
        ]),
    });
};