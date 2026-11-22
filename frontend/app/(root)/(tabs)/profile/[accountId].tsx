import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAccountsQuery } from "../../../../hooks/useAccounts";
import { useDeleteAccountMutation, useUpdateAccountMutation } from "../../../../hooks/useAccountMutation";
import { Account, UpdateAccountInput } from "../../../../apis/accountApis";
import { EditAccountModal } from "../../../../components/Profile/EditAccountModal";

const accountConfig: Record<Account["type"], { icon: string; label: string }> = {
    CASH: { icon: "💵", label: "Cash" },
    BANK: { icon: "🏦", label: "Bank Account" },
    CREDIT_CARD: { icon: "💳", label: "Credit Card" },
    OTHER: { icon: "💼", label: "Other" },
};

export default function AccountDetailsScreen() {
    const { accountId } = useLocalSearchParams<{ accountId: string }>();
    const [editVisible, setEditVisible] = useState(false);

    const { data: accounts = [], isLoading } = useAccountsQuery();
    const updateAccountMutation = useUpdateAccountMutation();
    const deleteAccountMutation = useDeleteAccountMutation();

    const account = accounts.find(account => account.id === accountId);
    const config = account ? accountConfig[account.type] : undefined;

    const handleUpdateAccount = (input: UpdateAccountInput) => {
        updateAccountMutation.mutate({ accountId, input });
        setEditVisible(false);
        router.back();
    };

    const handleDeleteAccount = () => {
        if (!account) return;

        Alert.alert(
            "Delete Account?",
            `Delete "${account.name}"? All transactions associated with this account will also be permanently deleted. This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteAccountMutation.mutate(account.id, { onSuccess: () => router.back() });
                    },
                },
            ],
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator color="#15803D" size="large" />
            </View>
        );
    }

    if (!account || !config) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 px-6">
                <Text className="text-base font-semibold text-gray-700">Account not found</Text>
                <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-green-700 px-5 py-3">
                    <Text className="font-semibold text-white">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const formattedBalance = Number(account.balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <View className="flex-1 bg-gray-50 p-1 mt-5">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4">
                <Pressable onPress={() => router.back()} className="rounded-full bg-white p-3">
                    <Feather name="arrow-left" size={20} color="#111827" />
                </Pressable>

                <Text className="text-lg font-bold text-gray-900">Account Details</Text>

                <Pressable onPress={() => setEditVisible(true)} className="rounded-full bg-white p-3">
                    <Feather name="edit-2" size={19} color="#15803D" />
                </Pressable>
            </View>

            {/* Balance Card */}
            <View className="mx-5 mt-6 overflow-hidden rounded-3xl bg-green-800 px-6 py-7">
                <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-white/15">
                        <Text className="text-2xl">{config.icon}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-green-100">{config.label}</Text>
                        <Text className="text-lg font-bold text-white">{account.name}</Text>
                    </View>
                </View>

                <Text className="mt-7 text-sm text-green-100">Current Balance</Text>
                <Text className="mt-1 text-3xl font-bold text-white">
                    {formattedBalance}
                </Text>
            </View>

            {/* Account Information */}
            <View className="mx-5 mt-6 rounded-2xl border border-gray-100 bg-white p-5">
                <Text className="mb-4 text-base font-bold text-gray-900">Account Information</Text>

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-sm text-gray-500">Account Name</Text>
                    <Text className="max-w-[60%] text-right text-sm font-semibold text-gray-900">{account.name}</Text>
                </View>

                <View className="border-t border-gray-100" />

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-sm text-gray-500">Account Type</Text>
                    <Text className="text-sm font-semibold text-gray-900">{config.label}</Text>
                </View>

                <View className="border-t border-gray-100" />

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-sm text-gray-500">Balance</Text>
                    <Text className="text-sm font-semibold text-gray-900">{formattedBalance}</Text>
                </View>
            </View>

            {/* Actions */}
            <View className="mx-5 mt-6 gap-3">
                <Pressable
                    onPress={() => setEditVisible(true)}
                    className="flex-row items-center justify-center gap-2 rounded-xl bg-green-700 py-4 active:bg-green-800"
                >
                    <Feather name="edit-2" size={17} color="white" />
                    <Text className="font-semibold text-white">Edit Account</Text>
                </Pressable>

                <Pressable
                    onPress={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    className="flex-row items-center justify-center gap-2 rounded-xl bg-pink-50 py-4 active:bg-pink-100"
                >
                    {deleteAccountMutation.isPending
                        ? <ActivityIndicator color="#DB2777" size="small" />
                        : <Feather name="trash-2" size={17} color="#DB2777" />}
                    <Text className="font-semibold text-pink-600">
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                    </Text>
                </Pressable>
            </View>

            <EditAccountModal
                visible={editVisible}
                account={account}
                onClose={() => setEditVisible(false)}
                onSubmit={handleUpdateAccount}
            />
        </View>
    );
}