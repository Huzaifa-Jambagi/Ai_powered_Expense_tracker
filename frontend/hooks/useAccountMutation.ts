import { Alert } from "react-native";
import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { queryKeys } from "../lib/query/queryKeys";
import { createAccount, updateAccount, deleteAccount } from "../apis/accountApis";
import type { Account, UpdateAccountInput } from "../apis/accountApis";

export const useCreateAccountMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const accountsKey = queryKeys.accounts(user?.id);

    return useMutation({
        mutationFn: createAccount,

        onSuccess: account => {
            const accounts = queryClient.getQueryData<Account[]>(accountsKey);

            if (accounts) {
                queryClient.setQueryData<Account[]>(accountsKey, [...accounts, account]);
            } else {
                return queryClient.invalidateQueries({ queryKey: accountsKey });
            }
        },

        onError: (_error, variables) => {
            Alert.alert(
                "Account creation failed",
                `We couldn't create "${variables.name}". Please try again later.`
            );
        },
    });
};

export const useUpdateAccountMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const accountsKey = queryKeys.accounts(user?.id);

    return useMutation({
        mutationFn: ({ accountId, input }: { accountId: string; input: UpdateAccountInput }) =>
            updateAccount(accountId, input),

        onMutate: async ({ accountId, input }) => {
            await queryClient.cancelQueries({ queryKey: accountsKey });

            const previousAccounts = queryClient.getQueryData<Account[]>(accountsKey);
            const accountName = previousAccounts?.find(account => account.id === accountId)?.name ?? input.name ?? "account";

            if (previousAccounts) {
                queryClient.setQueryData<Account[]>(
                    accountsKey,
                    previousAccounts.map(account =>
                        account.id === accountId ? { ...account, ...input } : account
                    )
                );
            }

            return { previousAccounts, accountName };
        },

        onError: (_error, _variables, context) => {
            if (context?.previousAccounts) {
                queryClient.setQueryData(accountsKey, context.previousAccounts);
            }

            Alert.alert(
                "Account update failed",
                `Changes to "${context?.accountName ?? "account"}" have been rolled back due to an error. Please try again later.`
            );
        },

        onSuccess: updatedAccount => {
            const accounts = queryClient.getQueryData<Account[]>(accountsKey);

            if (accounts) {
                queryClient.setQueryData<Account[]>(
                    accountsKey,
                    accounts.map(account => account.id === updatedAccount.id ? updatedAccount : account)
                );
            } else {
                return queryClient.invalidateQueries({ queryKey: accountsKey });
            }
        },
    });
};

export const useDeleteAccountMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const accountsKey = queryKeys.accounts(user?.id);

    return useMutation({
        mutationFn: deleteAccount,

        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountsKey }),

        onError: (error, accountId) => {
            const accountName = queryClient.getQueryData<Account[]>(accountsKey)
                ?.find(account => account.id === accountId)?.name ?? "account";

            const message = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;

            Alert.alert(
                "Account deletion failed",
                message ?? `We couldn't delete "${accountName}". Please try again later.`
            );
        },
    });
};