
import { memo } from "react";
import { View, Text } from "react-native";

type BudgetSummaryCardProps = {
    budget: number;
    spent: number;
    currencySymbol: string;
};

const formatAmount = (amount: number, symbol: string) =>
    `${symbol}${Math.abs(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

function BudgetSummaryCard({
    budget,
    spent,
    currencySymbol,
}: BudgetSummaryCardProps) {
    const remaining = budget - spent;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const progress = Math.min(Math.max(percentage, 0), 100);

    return (
        <View className="mx-4 overflow-hidden rounded-[24px] bg-[#005C3D] p-5">
            <Text className="text-sm font-medium text-white/80">
                Total Budget
            </Text>

            <Text className="mt-1 text-[34px] font-bold text-white">
                {formatAmount(budget, currencySymbol)}
            </Text>

            <View className="mb-2 mt-4 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-white">
                    {formatAmount(spent, currencySymbol)} spent
                </Text>

                <Text className="text-sm font-semibold text-white">
                    {remaining >= 0
                        ? `${formatAmount(remaining, currencySymbol)} left`
                        : `${formatAmount(remaining, currencySymbol)} over budget`}
                </Text>
            </View>

            <View className="h-2.5 overflow-hidden rounded-full bg-white/25">
                <View
                    className="h-full rounded-full bg-white"
                    style={{ width: `${progress}%` }}
                />
            </View>

            <Text className="mt-2 text-xs font-medium text-white/80">
                {Math.round(percentage)}% used
            </Text>
        </View>
    );
}

export default memo(BudgetSummaryCard);
