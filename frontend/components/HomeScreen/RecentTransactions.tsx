import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { type Transaction } from "../../apis/transactionApis";
import TransactionItem from "./TransactionItem";

type RecentTransactionsProps = {
    transactions: Transaction[];
    currencySymbol: string;
    isBalanceVisible: boolean;
};

export default function RecentTransactions({
    transactions,
    currencySymbol = "₹",
    isBalanceVisible,
}: RecentTransactionsProps) {
    return (
        <View className="mx-4 mt-5 mb-5">
            <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-gray-900">
                    Recent transactions
                </Text>

                <Pressable
                    onPress={() => router.push("/(root)/(tabs)/transactions")}
                    className="flex-row items-center gap-1"
                >
                    <Text className="text-[12px] font-semibold text-brand-primary">
                        See all
                    </Text>
                    <Text className="text-brand-primary">»</Text>
                </Pressable>
            </View>

            {transactions.length > 0 ? (
                <View className="gap-3">
                    {transactions.map((transaction) => (
                        <TransactionItem
                            key={transaction.id}
                            transaction={transaction}
                            currencySymbol={currencySymbol}
                            isBalanceVisible={isBalanceVisible}
                        />
                    ))}
                </View>
            ) : (
                <View className="items-center rounded-[20px] border border-gray-200/70 bg-white py-8">
                    <Text className="text-sm font-medium text-gray-700">
                        No transactions yet
                    </Text>
                    <Text className="mt-1 text-xs text-gray-400">
                        Your recent transactions will appear here.
                    </Text>
                </View>
            )}
        </View>
    );
}