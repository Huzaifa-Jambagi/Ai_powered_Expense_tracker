import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { getExpenseBreakdownApi } from "../apis/transactionApis";
import { queryKeys } from "../lib/query/queryKeys";

export const useExpenseBreakdownQuery = (month: string) => {
    const { user } = useUser();

    return useQuery({
        queryKey: queryKeys.expenseBreakdown(month, user?.id),
        queryFn: () => getExpenseBreakdownApi(month),
        staleTime: 20 * 60 * 1000,
        enabled: !!user?.id,
    });
};