import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

type MonthlyOverviewProps = {
    income: number;
    expense: number;
    currencySymbol?: string;
    isBalanceVisible: boolean;
};

const formatAmount = (amount: number, symbol = "₹") =>
    `${symbol}${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;

export default function MonthlyOverview({
    income,
    expense,
    currencySymbol,
    isBalanceVisible
}: MonthlyOverviewProps) {
    return (
        <View className="mx-4 -mt-6 mb-7 flex-row gap-3">
            <View className="flex-1 rounded-[20px] border border-gray-200/70 bg-white p-4">
                <View className="mb-3 flex-row items-center gap-2">
                    <Feather name="trending-up" size={16} color="#16A34A" />
                    <Text className="text-xs font-medium text-gray-500">
                        MONTHLY INCOME
                    </Text>
                </View>

                <Text className="text-xl font-bold text-green-600">
                    {isBalanceVisible
                        ? formatAmount(income, currencySymbol)
                        : "••••••"}
                </Text>
                <Text className="mt-1 text-xs text-gray-400">This month</Text>
            </View>

            <View className="flex-1 rounded-[20px] border border-gray-200/70 bg-white p-4">
                <View className="mb-3 flex-row items-center gap-2">
                    <Feather name="trending-down" size={16} color="#EF4444" />
                    <Text className="text-xs font-medium text-gray-500">
                        MONTHLY EXPENSE
                    </Text>
                </View>

                <Text className="text-xl font-bold text-red-500">
                    {isBalanceVisible
                        ? formatAmount(expense, currencySymbol)
                        : "••••••"}
                </Text>
                <Text className="mt-1 text-xs text-gray-400">This month</Text>
            </View>
        </View>
    );
}