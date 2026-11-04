import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/query/queryKeys";
import { useUser } from "@clerk/expo";
import { getTransactionsApi, TransactionFilters } from "../apis/transactionApis";

export const useTransactionsQuery = (filters: TransactionFilters = {}) => {
    const { user } = useUser();

    return useQuery({
        queryKey: queryKeys.transactions(user?.id, filters),
        queryFn: () => getTransactionsApi(filters),
        staleTime: 30 * 1000,
        enabled: !!user?.id,
    });
};