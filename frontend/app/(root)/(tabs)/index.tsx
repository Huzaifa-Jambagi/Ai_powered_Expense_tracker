import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { format } from "date-fns";

import { userStorage } from "../../../lib/store";

import { useTransactionsQuery } from "../../../hooks/useTransactionsQuery";
import { useTransactionChartQuery } from "../../../hooks/useTransactionChartQuery";
import { useExpenseBreakdownQuery } from "../../../hooks/useExpenseBreakdownQuery";
import { useBudgetQuery } from "../../../hooks/useBudgetQuery";
import { useAccountsQuery } from "../../../hooks/useAccounts";

import { getCategoryConfig } from "../../../constants/catogories";

import HomeHeader from "../../../components/HomeScreen/HomeHeader";
import BalanceCard from "../../../components/HomeScreen/BalanceCard";
import BalanceCardSkeleton from "../../../components/HomeScreen/BalanceCardSkeleton";
import QuickActions from "../../../components/HomeScreen/QuickActions";
import AIPromptBar from "../../../components/HomeScreen/AiPromptBar";
import ExpenseBreakdown from "../../../components/HomeScreen/ExpenseBreakdown";
import ExpenseBreakdownSkeleton from "../../../components/HomeScreen/ExpenseBreakdownSkeleton";
import RecentTransactions from "../../../components/HomeScreen/RecentTransactions";
import RecentTransactionsSkeleton from "../../../components/HomeScreen/RecentTransactionsSkeleton";

import MonthlyOverview from "../../../components/HomeScreen/MonthlyOverview";
import MonthlyOverviewSkeleton from "../../../components/HomeScreen/MonthlyOverviewSkeleton";

export const QUICK_ACTIONS = [
    {
        icon: "maximize",
        label: "AI Receipt\nScan",
        action: "scan",
        color: "#D81B60",
    },
    {
        icon: "mic",
        label: "Voice\nEntry",
        action: "voice",
        color: "#D81B60",
    },
    {
        icon: "plus",
        label: "Add\nManually",
        action: "manual",
        color: "#D81B60",
    },
] as const;

const HomeScreen = () => {
    const user = userStorage.getUser();
    const currencySymbol = user?.currency_symbol ?? "₹";
    const currentMonth = format(new Date(), "yyyy-MM");

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const { data: accounts = [], isLoading: accountsLoading } = useAccountsQuery();

    const { data: transactionPages, isLoading: transactionsLoading } =
        useTransactionsQuery({ month: currentMonth });

    const { data: chartData, isLoading: chartLoading } =
        useTransactionChartQuery({ month: currentMonth });

    const { data: breakdownData, isLoading: breakdownLoading } =
        useExpenseBreakdownQuery(currentMonth);

    const { data: budgetResponse, isLoading: budgetLoading } = useBudgetQuery();

    const budgets = budgetResponse?.data ?? [];

    const recentTransactions = transactionPages?.pages[0]?.data.slice(0, 5) ?? [];

    const totalBalance = useMemo(
        () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
        [accounts]
    );

    const monthIncome = useMemo(
        () => chartData?.reduce((sum, day) => sum + Number(day.income), 0) ?? 0,
        [chartData]
    );

    const monthExpense = useMemo(
        () => chartData?.reduce((sum, day) => sum + Number(day.expense), 0) ?? 0,
        [chartData]
    );

    const expenseBreakdown = useMemo(
        () => breakdownData?.map(({ category, amount }) => ({
            category,
            amount: Number(amount),
            color: getCategoryConfig(category).color,
        })) ?? [],
        [breakdownData]
    );

    const totalBudget = useMemo(
        () => budgets.reduce((sum, budget) => sum + Number(budget.amount), 0),
        [budgets]
    );

    return (
        <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
            <ScrollView
                className="flex-1 bg-[#F8F8F7]"
                showsVerticalScrollIndicator={false}
            >
                <HomeHeader
                    isBalanceVisible={isBalanceVisible}
                    onToggleVisibility={() => setIsBalanceVisible((prev) => !prev)}
                />

                {accountsLoading || budgetLoading || chartLoading ? (
                    <BalanceCardSkeleton />
                ) : (
                    <BalanceCard
                        totalBalance={totalBalance}
                        currencySymbol={currencySymbol}
                        budget={totalBudget}
                        monthExpense={monthExpense}
                        isBalanceVisible={isBalanceVisible}
                    />
                )}


                {chartLoading ? (
                    <MonthlyOverviewSkeleton />
                ) : (
                    <MonthlyOverview
                        income={monthIncome}
                        expense={monthExpense}
                        currencySymbol={currencySymbol}
                        isBalanceVisible={isBalanceVisible}
                    />
                )}

                <QuickActions actions={QUICK_ACTIONS} />

                <AIPromptBar />

                {breakdownLoading ? (
                    <ExpenseBreakdownSkeleton />
                ) : (
                    <ExpenseBreakdown
                        data={expenseBreakdown}
                        currencySymbol={currencySymbol}
                        isBalanceVisible={isBalanceVisible}
                    />
                )}

                {transactionsLoading ? (
                    <RecentTransactionsSkeleton />
                ) : (
                    <RecentTransactions
                        transactions={recentTransactions}
                        currencySymbol={currencySymbol}
                        isBalanceVisible={isBalanceVisible}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;
