import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { getCommitments, getCommitmentById } from "../apis/commitmentApi";
import { queryKeys } from "../lib/query/queryKeys";

export const useCommitmentsQuery = () => {
    const { user } = useUser();

    return useQuery({
        queryKey: queryKeys.commitments(user?.id),
        queryFn: getCommitments,
        staleTime: 60 * 1000,
        enabled: !!user?.id,
    });
};

export const useCommitmentQuery = (commitmentId: string) => {
    const { user } = useUser();

    return useQuery({
        queryKey: queryKeys.commitment(commitmentId, user?.id),
        queryFn: () => getCommitmentById(commitmentId),
        staleTime: 60 * 1000,
        enabled: !!user?.id && !!commitmentId,
    });
};
