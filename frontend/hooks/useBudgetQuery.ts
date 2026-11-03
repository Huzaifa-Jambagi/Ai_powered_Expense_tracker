import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/query/queryKeys";
import { useUser } from "@clerk/expo";
import { getBudget,setBudget } from "../apis/budgetApis";

export const useBudgetQuery = () => {

    const { user } = useUser()

    return useQuery({
        queryKey: queryKeys.budget(user?.id),
        queryFn: getBudget,
        enabled: !!user?.id
    })

}