import { useInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { getTransactionsApi, TransactionFilters } from "../apis/transactionApis";
import { queryKeys } from "../lib/query/queryKeys";

export const useTransactionsQuery = (filters: TransactionFilters) => {
    const { user } = useUser();

    return useInfiniteQuery({
        queryKey: queryKeys.transactions(filters, user?.id),
        queryFn: ({ pageParam }) => getTransactionsApi({ ...filters, offset: pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.pagination.nextOffset ?? undefined,
        staleTime: 60 * 1000,
        enabled: !!user?.id,
    });
};