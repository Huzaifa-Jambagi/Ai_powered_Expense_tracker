import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import BalanceBackground from "../../../../assets/images/total_balance_bg.svg";
import { useAccountsQuery } from "../../../../hooks/useAccounts";
import { useDeleteAccountMutation, useUpdateAccountMutation } from "../../../../hooks/useAccountMutation";
import type { Account, UpdateAccountInput } from "../../../../apis/accountApis";
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
                        deleteAccountMutation.mutate(account.id, {
                            onSuccess: () => router.back(),
                        });
                    },
                },
            ],
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator color="#006341" size="large" />
            </View>
        );
    }

    if (!account || !config) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 px-6">
                <Text className="text-base font-semibold text-gray-700">Account not found</Text>

                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    className="mt-4 h-12 items-center justify-center rounded-xl bg-[#006341] px-5"
                >
                    <Text className="text-sm font-semibold text-white">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const formattedBalance = Number(account.balance).toLocaleString("en-IN", {
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
                    <Feather name="edit-2" size={19} color="#006341" />
                </Pressable>
            </View>

            {/* Balance Card */}
            <View className="relative mx-5 mt-6 h-[210px] overflow-hidden rounded-[30px]">
                <View pointerEvents="none" className="absolute inset-0">
                    <BalanceBackground width="100%" height="100%" />
                </View>

                <View className="z-10 flex-1 justify-center p-6">
                    <View className="flex-row items-center gap-3">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-white/15">
                            <Text className="text-2xl">{config.icon}</Text>
                        </View>

                        <View className="flex-1">
                            <Text className="text-sm font-medium text-white/80">
                                {config.label}
                            </Text>

                            <Text className="text-lg font-bold text-white" numberOfLines={1}>
                                {account.name}
                            </Text>
                        </View>
                    </View>

                    <Text className="mt-7 text-sm font-medium text-white/80">
                        Current Balance
                    </Text>

                    <Text
                        className="mt-1 text-4xl font-bold text-white"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formattedBalance}
                    </Text>
                </View>
            </View>

            {/* Account Information */}
            <View className="mx-5 mt-6 rounded-2xl border border-gray-100 bg-white p-5">
                <Text className="mb-4 text-base font-bold text-gray-900">
                    Account Information
                </Text>

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-sm text-gray-500">Account Name</Text>
                    <Text className="max-w-[60%] text-right text-sm font-semibold text-gray-900">
                        {account.name}
                    </Text>
                </View>

                <View className="border-t border-gray-100" />

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-sm text-gray-500">Account Type</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                        {config.label}
                    </Text>
                </View>

                <View className="border-t border-gray-100" />

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-sm text-gray-500">Balance</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                        {formattedBalance}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View className="mx-5 mt-6 gap-3">
                <Pressable
                    onPress={() => setEditVisible(true)}
                    accessibilityRole="button"
                    className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#006341] active:opacity-80"
                >
                    <Feather name="edit-2" size={18} color="white" />
                    <Text className="text-sm font-semibold text-white">
                        Edit Account
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    accessibilityRole="button"
                    className={`h-12 flex-row items-center justify-center gap-2 rounded-xl bg-rose-600 ${
                        deleteAccountMutation.isPending ? "opacity-60" : "active:bg-rose-700"
                    }`}
                >
                    {deleteAccountMutation.isPending
                        ? <ActivityIndicator color="white" size="small" />
                        : <Feather name="trash-2" size={17} color="white" />}

                    <Text className="text-sm font-semibold text-white">
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