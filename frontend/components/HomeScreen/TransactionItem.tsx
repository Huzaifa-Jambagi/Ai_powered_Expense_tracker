import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { type Transaction } from "../../apis/transactionApis";
import { getCategoryConfig } from "../../constants/catogories";

type TransactionItemProps = {
    transaction: Transaction;
    currencySymbol?: string;
    isBalanceVisible: boolean;
};

const formatAmount = (amount: number, symbol: string) =>
    `${symbol}${Math.abs(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;

export default function TransactionItem({
    transaction,
    currencySymbol = "₹",
    isBalanceVisible,
}: TransactionItemProps) {
    const isIncome = transaction.type === "INCOME";
    const category = getCategoryConfig(transaction.category);

    const color = isIncome ? "#15803D" : "#DB2777";
    const backgroundColor = isIncome ? "#E8F7E9" : "#FCE7EF";

    return (
        <View className="flex-row items-center rounded-[22px] border border-gray-100 bg-white p-4">
            {/* Category icon */}
            <View
                className="mr-4 h-[66px] w-[66px] items-center justify-center rounded-[22px]"
                style={{ backgroundColor }}
            >
                <Text className="text-[30px]">{category.icon}</Text>
            </View>

            {/* Transaction details */}
            <View className="min-w-0 flex-1">
                <Text
                    numberOfLines={1}
                    className="text-[16px] font-bold text-gray-900"
                >
                    {transaction.description || category.label}
                </Text>

                <View className="mt-2 flex-row items-center gap-2">
                    <Feather name="edit-2" size={15} color="#858995" />

                    <View
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor }}
                    >
                        <Text
                            className="text-[12px] font-medium"
                            style={{ color }}
                        >
                            {category.label}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Amount */}
            <Text
                className="ml-2 text-[17px] font-bold"
                style={{ color }}
            >
                {isBalanceVisible
                    ? `${isIncome ? "+" : "-"}${formatAmount(Number(transaction.amount), currencySymbol)}`
                    : "••••••"}
            </Text>
        </View>
    );
}