import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";

import { setBudget } from "../apis/budgetApis";
import { queryKeys } from "../lib/query/queryKeys";

export const useBudgetMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();

    return useMutation({
        mutationFn: setBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.budget(user?.id),
            });
        },
    });
};

