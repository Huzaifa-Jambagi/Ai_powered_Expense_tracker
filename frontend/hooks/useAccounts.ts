import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/query/queryKeys";
import { useUser } from "@clerk/expo";
import { getAccount } from "../apis/accountApis";

export const useAccountsQuery = () => {

    const { user } = useUser()

    return useQuery({
        queryKey: queryKeys.accounts(user?.id),
        queryFn: getAccount,
        enabled: !!user?.id
    })

}