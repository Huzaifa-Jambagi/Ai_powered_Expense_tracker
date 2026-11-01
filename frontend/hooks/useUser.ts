import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../apis/userApis";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUserDetails,
    enabled: false,
  });
};