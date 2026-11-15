import { memo } from "react";
import { View, Text } from "react-native";
import { format, isValid } from "date-fns";

import type { Transaction } from "../../apis/transactionApis";
import { getCategoryConfig } from "../../constants/catogories";

type TransactionItemProps = {
    transaction: Transaction;
    currencySymbol?: string;
    isBalanceVisible: boolean;
};

const formatAmount = (amount: number, symbol: string) =>
    `${symbol}${Math.abs(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

function TransactionItem({
    transaction,
    currencySymbol = "₹",
    isBalanceVisible,
}: TransactionItemProps) {
    const isIncome = transaction.type === "INCOME";
    const category = getCategoryConfig(transaction.category);
    const amountColor = isIncome ? "#16A34A" : "#EF4444";

    const transactionDate = new Date(transaction.date);
    const dateLabel = isValid(transactionDate)
        ? format(transactionDate, "EEE, dd MMM yyyy · hh:mm a")
        : "";

    return (
        <View className="mb-2 flex-row items-center rounded-[18px] border border-gray-200/70 bg-white px-3 py-4">
            {/* Category emoji */}
            <View className="h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                <Text className="text-2xl">{category.icon}</Text>
            </View>

            {/* Transaction details */}
            <View className="ml-3 flex-1 justify-center">
                <Text
                    numberOfLines={1}
                    className="text-base font-bold text-slate-950"
                >
                    {category.label}
                </Text>

                <Text className="mt-1 text-xs text-gray-400">
                    {dateLabel}
                </Text>
            </View>

            {/* Amount */}
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                className="ml-2 text-lg font-bold"
                style={{ color: amountColor }}
            >
                {isBalanceVisible
                    ? `${isIncome ? "+" : "-"}${formatAmount(Number(transaction.amount) || 0, currencySymbol)}`
                    : "••••••"}
            </Text>
        </View>
    );
}

export default memo(TransactionItem);