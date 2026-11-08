import {
    useMutation,
    useQueryClient,
    useIsMutating,
} from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { Alert } from "react-native";
import type { Budget, GetBudgetResponse } from "../apis/budgetApis";
import { queryKeys } from "../lib/query/queryKeys";
import { setBudget } from "../apis/budgetApis";
import { deleteBudget } from "../apis/budgetApis";

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

            const previousData = queryClient.getQueryData<GetBudgetResponse>(queryKey);
            const currentData = previousData ?? {
                success: true,
                data: [],
                message: "",
            };

            const existingBudget = currentData.data.some((budget) => budget.category === category);

            queryClient.setQueryData<GetBudgetResponse>(queryKey, {
                ...currentData,
                data: existingBudget
                    ? currentData.data.map((budget) => {
                        if (budget.category !== category) return budget;

                        const spent = Number(budget.spent);

                        return {
                            ...budget,
                            amount,
                            remaining: amount - spent,
                            percentage: amount > 0 ? (spent / amount) * 100 : 0,
                        };
                    })
                    : [
                        ...currentData.data,
                        {
                            id: `optimistic-${category}`,
                            user_id: user!.id,
                            category,
                            amount,
                            last_alert_sent: null,
                            last_alert_threshold: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            spent: 0,
                            remaining: amount,
                            percentage: 0,
                        },
                    ],
            });

            return { previousData };
        },

        onError: (error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            } else {
                queryClient.removeQueries({ queryKey, exact: true });
            }

            Alert.alert("Budget Update Failed", "We couldn't save your budget. Please try again.");

            console.error("Budget mutation failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey }) === 1) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
    });
};


export const useDeleteBudgetMutation = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const queryKey = queryKeys.budget(user?.id);
    const mutationKey = ["budgets", "delete", user?.id] as const;

    return useMutation({
        mutationKey,
        mutationFn: deleteBudget,

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<GetBudgetResponse>(queryKey);

            if (previousData) {
                queryClient.setQueryData<GetBudgetResponse>(queryKey, {
                    ...previousData,
                    data: previousData.data.filter((budget) => budget.id !== id),
                });
            }

            return { previousData };
        },

        onError: (error, _id, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }

            Alert.alert("Delete Failed", "We couldn't delete this budget. Please try again.");
            console.error("Budget deletion failed:", error);
        },

        onSettled: () => {
            if (queryClient.isMutating({ mutationKey }) === 1) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
    });
};