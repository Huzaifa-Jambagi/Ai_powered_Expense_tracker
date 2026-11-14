import { View, Text } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { userStorage } from "../../lib/store";


type TransactionsSummaryProps = {
    income: number;
    expense: number;
    net: number;
};

const formatAmount = (amount: number, symbol: string) =>
    `${amount < 0 ? "-" : ""}${symbol}${Math.abs(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

export default function TransactionsSummary({
    income,
    expense,
    net,
}: TransactionsSummaryProps) {
    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";
    const netColor = net > 0 ? "#16A34A" : net < 0 ? "#EF4444" : "#64748B";

    return (
        <View className="flex-row items-center rounded-[20px] border border-gray-200/70 bg-white px-2 py-3">
            {/* Income */}
            <View className="flex-1 items-center">
                <Feather name="arrow-down-circle" size={22} color="#16A34A" />

                <Text className="mt-1 text-base font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                    {formatAmount(income, currencySymbol)}
                </Text>

                <Text className="text-sm text-gray-600">Income</Text>
            </View>

            <View className="h-14 w-px bg-gray-200" />

            {/* Expense */}
            <View className="flex-1 items-center">
                <Feather name="arrow-up-circle" size={22} color="#EF4444" />

                <Text className="mt-1 text-base font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                    {formatAmount(expense, currencySymbol)}
                </Text>

                <Text className="text-sm text-gray-600">Expense</Text>
            </View>

            <View className="h-14 w-px bg-gray-200" />

            {/* Net */}
            <View className="flex-1 items-center">
                <MaterialCommunityIcons name="wallet-outline" size={22} color="#2563EB" />

                <Text
                    className="mt-1 text-base font-bold"
                    style={{ color: netColor }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {formatAmount(net, currencySymbol)}
                </Text>

                <Text className="text-sm text-gray-600">Net</Text>
            </View>
        </View>
    );
}