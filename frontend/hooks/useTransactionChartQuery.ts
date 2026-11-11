import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { getTransactionChartApi, TransactionChartFilters } from "../apis/transactionApis";
import { queryKeys } from "../lib/query/queryKeys";

export const useTransactionChartQuery = (filters: TransactionChartFilters) => {
    const { user } = useUser();

    return useQuery({
        queryKey: queryKeys.transactionChart(filters, user?.id),
        queryFn: () => getTransactionChartApi(filters),
        staleTime: 60 * 1000,
        enabled: !!user?.id,
    });
};