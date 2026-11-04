import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../apis/userApis";

export const useUser = (enabled: boolean) => {
    return useQuery({
        queryKey: ["user"],
        queryFn: getUserDetails,
        enabled,
    });
};