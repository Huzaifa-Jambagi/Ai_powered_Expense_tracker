import { useMemo, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useBudgetQuery } from "../../../../hooks/useBudgetQuery";
import { userStorage } from "../../../../lib/store";
import type { Budget } from "../../../../apis/budgetApis";

import BudgetEmptyState from "../../../../components/Budget/BudgetEmptyState";
import BudgetSummaryCard from "../../../../components/Budget/BudgetSummaryCard";
import BudgetStats from "../../../../components/Budget/BudgetStats";
import BudgetCategoryCard from "../../../../components/Budget/BudgetCategoryCard";

const SET_BUDGET_ROUTE = "/(root)/(tabs)/budgets/set-budget";
const EMPTY_BUDGETS: Budget[] = [];

export default function Budget() {
    const router = useRouter();
    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";

    const { data, isLoading, isError, error } = useBudgetQuery();

    const budgets = data?.data ?? EMPTY_BUDGETS;

    const totals = useMemo(
        () =>
            budgets.reduce(
                (acc, budget) => {
                    const amount = Number(budget.amount);
                    const spent = Number(budget.spent);
                    const remaining = Number(budget.remaining);

                    acc.budget += amount;
                    acc.spent += spent;
                    acc.saved += Math.max(remaining, 0);
                    acc.overspent += Math.max(-remaining, 0);

                    return acc;
                },
                { budget: 0, spent: 0, saved: 0, overspent: 0 }
            ),
        [budgets]
    );

    const openBudgetForm = useCallback(
        (budget?: Budget) => {
            router.push({
                pathname: SET_BUDGET_ROUTE,
                params: budget
                    ? {
                        category: budget.category,
                        amount: String(budget.amount),
                    }
                    : {},
            });
        },
        [router]
    );

    const content = isLoading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#006341" />
        </View>
    ) : isError && !data ? (
        <View className="flex-1 items-center justify-center px-5">
            <Text className="text-center text-sm text-[#687080]">
                {error instanceof Error
                    ? error.message
                    : "Unable to load budgets."}
            </Text>

            <Pressable
                onPress={() => router.replace(SET_BUDGET_ROUTE)}
                className="mt-4 rounded-xl bg-[#006341] px-6 py-3"
            >
                <Text className="font-semibold text-white">
                    Set Budget
                </Text>
            </Pressable>
        </View>
    ) : budgets.length === 0 ? (
        <BudgetEmptyState />
    ) : (
        <>
            <BudgetSummaryCard
                budget={totals.budget}
                spent={totals.spent}
                currencySymbol={currencySymbol}
            />

            <View className="mt-4">
                <BudgetStats
                    saved={totals.saved}
                    overspent={totals.overspent}
                    currencySymbol={currencySymbol}
                />
            </View>

            <View className="mt-7 px-5">
                <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-[19px] font-bold text-[#111B3A]">
                        Your Budgets
                    </Text>

                    <Pressable
                        onPress={() => openBudgetForm()}
                        className="flex-row items-center gap-2 rounded-full bg-[#FCE4EC] px-3 py-2"
                    >
                        <Feather name="plus" size={18} color="#D81B60" />

                        <Text className="text-xs font-semibold text-[#D81B60]">
                            Set Budget
                        </Text>
                    </Pressable>
                </View>

                <View className="gap-2">
                    {budgets.map((budget) => (
                        <BudgetCategoryCard
                            key={budget.id}
                            budget={budget}
                            currencySymbol={currencySymbol}
                            onPress={openBudgetForm}
                        />
                    ))}
                </View>
            </View>
        </>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <View className="px-5 pb-4 pt-3">
                <Text className="text-[22px] font-bold text-[#111B3A]">
                    Budgets
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 24,
                }}
            >
                {content}
            </ScrollView>
        </SafeAreaView>
    );
}
