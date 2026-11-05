import { memo, useMemo } from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Transaction } from "../../apis/transactionApis";
import { getCategoryConfig } from "../../constants/catogories";

export type ExpenseBreakdownProps = {
    data: {
        category: Transaction["category"];
        amount: number;
        color: string;
    }[];
    currencySymbol?: string;
    isBalanceVisible: boolean;
};

const formatAmount = (amount: number, symbol: string) =>
    `${symbol}${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;

function ExpenseBreakdown({
    data,
    currencySymbol = "₹",
    isBalanceVisible,
}: ExpenseBreakdownProps) {
    const total = useMemo(
        () => data.reduce((sum, item) => sum + item.amount, 0),
        [data]
    );

    const chartData = useMemo(
        () =>
            data.map((item) => ({
                value: item.amount,
                color: item.color,
            })),
        [data]
    );

    const legendData = useMemo(
        () =>
            data.slice(0, 6).map((item) => ({
                ...item,
                label: getCategoryConfig(item.category).label,
                percentage: (item.amount / total) * 100,
            })),
        [data, total]
    );

    return (
        <View className="mx-4 mt-4 rounded-[20px] border border-gray-200/70 bg-white p-4">
            <Text className="mb-4 ml-2 mt-1 text-[15px] font-semibold text-gray-900">
                Expense Breakdown
            </Text>

            {data.length > 0 && total > 0 ? (
                <View className="flex-row items-center">
                    <View className="items-center justify-center">
                        <PieChart
                            donut
                            data={chartData}
                            radius={65}
                            innerRadius={43}
                            innerCircleColor="#FFFFFF"
                            centerLabelComponent={() => (
                                <View className="items-center">
                                    <Text className="text-[13px] font-bold text-gray-900">
                                        {isBalanceVisible
                                            ? formatAmount(total, currencySymbol)
                                            : "••••••"}
                                    </Text>
                                    <Text className="text-[10px] text-gray-500">
                                        Total Expense
                                    </Text>
                                </View>
                            )}
                        />
                    </View>

                    <View className="ml-12 flex-1 gap-2">
                        {legendData.map((item) => (
                            <View
                                key={item.category}
                                className="flex-row items-center justify-between"
                            >
                                <View className="mr-2 flex-1 flex-row items-center gap-2">
                                    <View
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <Text className="flex-1 text-[11px] text-gray-600">
                                        {item.label}
                                    </Text>
                                </View>

                                <Text className="text-[11px] font-semibold text-gray-900">
                                    {item.percentage.toFixed(1)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View className="items-center justify-center py-14">
                    <Text className="text-sm font-medium text-gray-700">
                        No transactions yet
                    </Text>
                    <Text className="mt-1 text-xs text-gray-400">
                        Your expense breakdown will appear here.
                    </Text>
                </View>
            )}
        </View>
    );
}

export default memo(ExpenseBreakdown);