import { useQuery } from "@tanstack/react-query";
import { getSubscriptions, getSubscription } from "../apis/subscriptionApi";
import { queryKeys } from "../lib/query/queryKeys";

export const useSubscriptionsQuery = (userId?: string) => {
    return useQuery({
        queryKey: queryKeys.subscriptions(userId),
        queryFn: async () => {
            const response = await getSubscriptions();
            return response.data;
        },
        enabled: !!userId,
    });
};

export const useSubscriptionQuery = (subscriptionId: string, userId?: string) => {
    return useQuery({
        queryKey: queryKeys.subscription(subscriptionId, userId),
        queryFn: async () => {
            const response = await getSubscription(subscriptionId);
            return response.data;
        },
        enabled: !!userId && !!subscriptionId,
    });
};