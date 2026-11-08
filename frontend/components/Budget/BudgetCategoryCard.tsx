import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import {
    getCategoryConfig,
    type CategoryKey,
} from "../../constants/catogories";
import type { Budget } from "../../apis/budgetApis";

type BudgetCategoryCardProps = {
    budget: Budget;
    currencySymbol: string;
    onPress: (budget: Budget) => void;
    disabled?: boolean;
};

const formatAmount = (amount: number, symbol: string) =>
    `${symbol}${Math.abs(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

function BudgetCategoryCard({
    budget,
    currencySymbol,
    onPress,
    disabled = false,
}: BudgetCategoryCardProps) {
    const category = getCategoryConfig(budget.category as CategoryKey);
    const remaining = Number(budget.remaining);
    const percentage = Number(budget.percentage) || 0;
    const isOverspent = remaining < 0;
    const progress = Math.min(Math.max(percentage, 0), 100);

    return (
        <Pressable
            disabled={disabled}
            onPress={() => onPress(budget)}
            accessibilityRole="button"
            className={`rounded-2xl border border-[#EAEAEA] bg-white p-3 ${
                disabled ? "opacity-50" : ""
            }`}
        >
            <View className="flex-row items-center">
                <View
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    <Text className="text-[25px]">{category.icon}</Text>
                </View>

                <View className="ml-3 flex-1">
                    <View className="flex-row items-center justify-between">
                        <Text
                            className="flex-1 text-sm font-bold text-[#111B3A]"
                            numberOfLines={1}
                        >
                            {category.label}
                        </Text>

                        <Text className="ml-2 text-xs font-semibold text-[#111B3A]">
                            {formatAmount(Number(budget.spent), currencySymbol)}
                            {" / "}
                            {formatAmount(Number(budget.amount), currencySymbol)}
                        </Text>
                    </View>

                    <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E5E5E5]">
                        <View
                            className={`h-full rounded-full ${
                                isOverspent ? "bg-[#E63946]" : "bg-[#16A34A]"
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    <Text className="mt-1.5 text-xs text-[#687080]">
                        {Math.round(percentage)}% used
                        <Text
                            className={
                                isOverspent
                                    ? "font-semibold text-[#E63946]"
                                    : "font-semibold text-[#15803D]"
                            }
                        >
                            {"  "}•  {isOverspent ? "Overspent " : "Saved "}
                            {formatAmount(remaining, currencySymbol)}
                        </Text>
                    </Text>
                </View>

                <Feather
                    name="chevron-right"
                    size={20}
                    color="#374151"
                    style={{ marginLeft: 5 }}
                />
            </View>
        </Pressable>
    );
}

export default memo(BudgetCategoryCard);
