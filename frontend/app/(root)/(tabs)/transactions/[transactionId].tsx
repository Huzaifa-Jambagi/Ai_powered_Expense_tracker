import { useMemo, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUser } from "@clerk/expo";
import { format, isValid } from "date-fns";

import type { Transaction } from "../../../../apis/transactionApis";
import { queryKeys } from "../../../../lib/query/queryKeys";
import { getCategoryConfig } from "../../../../constants/catogories";
import { userStorage } from "../../../../lib/store";
import { useDeleteTransactionMutation } from "../../../../hooks/useAddTransactionMutation";

type TransactionPage = {
    data: Transaction[];
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
        nextOffset: number | null;
    };
};

type DetailRowProps = {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    children: ReactNode;
    isLast?: boolean;
    multiline?: boolean;
};

const formatAmount = (amount: number, currencySymbol: string) =>
    `${amount < 0 ? "-" : ""}${currencySymbol}${Math.abs(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

function DetailRow({
    icon,
    label,
    children,
    isLast,
    multiline = false,
}: DetailRowProps) {
    return (
        <View
            className={`min-h-[58px] flex-row py-3 ${multiline ? "items-start" : "items-center"
                } ${!isLast ? "border-b border-gray-100" : ""}`}
        >
            <View className="w-8">
                <Feather name={icon} size={20} color="#475569" />
            </View>

            <Text className="ml-2 w-[76px] text-sm font-semibold text-slate-950">
                {label}
            </Text>

            <View className="ml-2 flex-1">
                {children}
            </View>
        </View>
    );
}

export default function TransactionDetailsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useUser();

    const { transactionId } = useLocalSearchParams<{
        transactionId: string;
    }>();

    const deleteMutation = useDeleteTransactionMutation();

    const handleDelete = () => {
        if (!transaction) return;

        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteMutation.mutate({
                            transaction,
                            currencySymbol,
                            onOptimisticUpdate: () => router.back(),
                        });
                    },
                },
            ]
        );
    };
    // Find transaction in all cached filter variations
    const transaction = useMemo(() => {
        if (!user?.id || !transactionId) return undefined;

        const cachedQueries = queryClient.getQueriesData<
            InfiniteData<TransactionPage>
        >({
            queryKey: queryKeys.transactionsRoot(user.id),
        });

        for (const [, cachedData] of cachedQueries) {
            for (const page of cachedData?.pages ?? []) {
                const match = page.data.find(
                    (item) => item.id === transactionId
                );

                if (match) return match;
            }
        }

        return undefined;
    }, [queryClient, user?.id, transactionId]);

    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";

    if (!transaction) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <Feather name="file" size={40} color="#94A3B8" />
                <Text className="mt-4 text-base font-semibold text-slate-900">
                    Transaction not found
                </Text>

                <Pressable
                    onPress={() => router.back()}
                    className="mt-5 rounded-xl bg-pink-100 px-5 py-3"
                >
                    <Text className="font-semibold text-rose-600">
                        Go Back
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const category = getCategoryConfig(transaction.category);
    const isIncome = transaction.type === "INCOME";

    const accentColor = isIncome ? "#16A34A" : "#E11D48";
    const badgeBackground = isIncome ? "bg-green-100" : "bg-rose-100";
    const badgeText = isIncome ? "text-green-700" : "text-rose-600";

    const amount = Number(transaction.amount) || 0;

    const transactionDate = new Date(transaction.date);
    const validDate = isValid(transactionDate);

    const dateLabel = validDate
        ? format(transactionDate, "EEE, dd MMM yyyy")
        : "—";

    const timeLabel = validDate
        ? format(transactionDate, "hh:mm a")
        : "—";

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center px-5 py-2">
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={10}
                    className="h-10 w-10 items-center justify-center"
                >
                    <Feather name="arrow-left" size={25} color="#0F172A" />
                </Pressable>

                <Text className="flex-1 text-center text-xl font-bold text-slate-950">
                    Transaction Details
                </Text>

                <View className="w-10" />
            </View>

            {/* Transaction content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 24,
                    flexGrow: 1,
                }}
            >
                {/* Overview */}
                <View className="items-center pb-7 pt-7">
                    <View className="h-28 w-28 items-center justify-center rounded-full bg-pink-100">
                        <Text className="text-5xl">
                            {category.icon}
                        </Text>
                    </View>

                    <Text className="mt-4 text-2xl font-bold text-slate-950">
                        {category.label}
                    </Text>

                    <Text
                        className="mt-2 text-3xl font-bold"
                        style={{ color: accentColor }}
                    >
                        {isIncome ? "+" : "-"}
                        {formatAmount(amount, currencySymbol)}
                    </Text>

                    <View className={`mt-3 rounded-full px-5 py-2 ${badgeBackground}`}>
                        <Text className={`text-sm font-semibold ${badgeText}`}>
                            {isIncome ? "Income" : "Expense"}
                        </Text>
                    </View>
                </View>

                {/* Transaction details */}
                <View className="rounded-[22px] border border-gray-200/70 bg-white px-4">
                    <DetailRow icon="edit-2" label="Note" multiline>
                        <Text
                            className="text-sm font-medium leading-5 text-slate-950"
                            style={{ flexShrink: 1 }}
                        >
                            {transaction.description || "—"}
                        </Text>
                    </DetailRow>

                    <DetailRow icon="calendar" label="Date">
                        <Text className="text-sm font-medium text-slate-950">
                            {dateLabel}
                        </Text>
                    </DetailRow>

                    <DetailRow icon="clock" label="Time">
                        <Text className="text-sm font-medium text-slate-950">
                            {timeLabel}
                        </Text>
                    </DetailRow>

                    <DetailRow icon="credit-card" label="Account">
                        <Text className="text-sm font-medium text-slate-950">
                            {transaction.accountName}
                        </Text>
                    </DetailRow>

                    <DetailRow icon="tag" label="Type" isLast>
                        <View className={`self-start rounded-full px-4 py-2 ${badgeBackground}`}>
                            <Text className={`text-sm font-semibold ${badgeText}`}>
                                {isIncome ? "Income" : "Expense"}
                            </Text>
                        </View>
                    </DetailRow>
                </View>
            </ScrollView>

            {/* Bottom actions - visual placeholders for now */}
            <View className="border-t border-gray-100 px-5 py-4">
                <Pressable
                    onPress={handleDelete}
                    disabled={deleteMutation.isPending}
                    accessibilityRole="button"
                    className={`h-14 flex-row items-center justify-center gap-3 rounded-2xl bg-rose-700 ${deleteMutation.isPending ? "opacity-60" : "active:bg-rose-800"
                        }`}
                >
                    <Feather name="trash-2" size={20} color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">
                        {deleteMutation.isPending ? "Deleting..." : "Delete Transaction"}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
