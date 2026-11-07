import {
    useMutation,
    useQueryClient,
    useIsMutating,
} from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { Alert } from "react-native";

import { queryKeys } from "../lib/query/queryKeys";
import { setBudget } from "../apis/budgetApis";
import type { GetBudgetResponse } from "../apis/budgetApis";

type SetBudgetInput = {
    category: string;
    amount: number;
};

export const budgetMutationKey = (userId?: string) =>
    ["budgets", "set", userId] as const;

export const useBudgetSavePending = () => {
    const { user } = useUser();

    return useIsMutating({
        mutationKey: budgetMutationKey(user?.id),
    }) > 0;
};

export const useSetBudgetMutation = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const queryKey = queryKeys.budget(user?.id);
    const mutationKey = budgetMutationKey(user?.id);

    return useMutation({
        mutationKey,

        mutationFn: ({ category, amount }: SetBudgetInput) =>
            setBudget(category, amount),

        onMutate: async ({ category, amount }) => {
            await queryClient.cancelQueries({ queryKey });

            const previousData =
                queryClient.getQueryData<GetBudgetResponse>(queryKey);

            if (previousData) {
                queryClient.setQueryData<GetBudgetResponse>(queryKey, {
                    ...previousData,
                    data: previousData.data.map((budget) => {
                        if (budget.category !== category) return budget;

                        const spent = Number(budget.spent);

                        return {
                            ...budget,
                            amount,
                            remaining: amount - spent,
                            percentage: amount > 0 ? (spent / amount) * 100 : 0,
                        };
                    }),
                });
            }

            return { previousData };
        },

        onError: (error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }

            Alert.alert(
                "Budget Update Failed",
                context?.previousData
                    ? "Your previous budget has been restored. Please try again."
                    : "We couldn't save your budget. Please try again."
            );

            console.error("Budget mutation failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey }) === 1) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
    });
};
