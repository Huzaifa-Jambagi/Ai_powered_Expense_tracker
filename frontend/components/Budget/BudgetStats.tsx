
import { memo } from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

type BudgetStatsProps = {
    saved: number;
    overspent: number;
    currencySymbol: string;
};

const formatAmount = (amount: number, symbol: string) =>
    `${symbol}${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

function BudgetStats({
    saved,
    overspent,
    currencySymbol,
}: BudgetStatsProps) {
    return (
        <View className="mx-4 flex-row gap-3">
            <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-[#EAEAEA] bg-white p-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8F7EF]">
                    <Feather
                        name="trending-down"
                        size={19}
                        color="#16A34A"
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-xs font-medium text-[#687080]">
                        Total Saved
                    </Text>

                    <Text
                        className="mt-1 text-lg font-bold text-[#16A34A]"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formatAmount(saved, currencySymbol)}
                    </Text>
                </View>
            </View>

            <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-[#EAEAEA] bg-white p-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F1]">
                    <Feather
                        name="trending-up"
                        size={19}
                        color="#E63946"
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-xs font-medium text-[#687080]">
                        Total Overspent
                    </Text>

                    <Text
                        className="mt-1 text-lg font-bold text-[#E63946]"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formatAmount(overspent, currencySymbol)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default memo(BudgetStats);
