import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserCurrency, type UserDetails } from "../apis/userApis";
import { userStorage } from "../lib/store";

const userQueryKey = ["user"] as const;

export const useUpdateCurrencyMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserCurrency,

        onMutate: async currency => {
            await queryClient.cancelQueries({ queryKey: userQueryKey });

            const previousUser = queryClient.getQueryData<UserDetails>(userQueryKey);
            const previousStoredCurrency = userStorage.getUser()?.currency;

            if (previousUser) {
                queryClient.setQueryData<UserDetails>(userQueryKey, {
                    ...previousUser,
                    currency,
                });
            }

            userStorage.updateCurrency(currency);

            return { previousUser, previousStoredCurrency };
        },

        onError: (_error, _currency, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(userQueryKey, context.previousUser);
            }

            if (context?.previousStoredCurrency !== undefined) {
                userStorage.updateCurrency(context.previousStoredCurrency);
            }

            Alert.alert(
                "Currency update failed",
                "We couldn't update your preferred currency. Please try again later.",
            );
        },

        onSuccess: updatedUser => {
            queryClient.setQueryData(userQueryKey, updatedUser);
            userStorage.setUser(updatedUser);
        },
    });
};