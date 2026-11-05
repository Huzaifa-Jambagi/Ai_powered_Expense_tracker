import { Link } from 'expo-router'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { userStorage } from '../../../lib/store';
import { useTransactionsQuery } from '../../../hooks/useTransactionsQuery';
import { useBudgetQuery } from '../../../hooks/useBudgetQuery';
import { useAccountsQuery } from '../../../hooks/useAccounts';
import { useEffect, useMemo, useState, useRef } from "react";
import { isSameMonth } from 'date-fns'
import { getCategoryConfig } from '../../../constants/catogories';
import { type Transaction } from '../../../apis/transactionApis';
import HomeHeader from '../../../components/HomeScreen/HomeHeader';
import BalanceCard from '../../../components/HomeScreen/BalanceCard';
import QuickActions from '../../../components/HomeScreen/QuickActions';
import AIPromptBar from '../../../components/HomeScreen/AiPromptBar';
import ExpenseBreakdown from '../../../components/HomeScreen/ExpenseBreakdown';
import RecentTransactions from '../../../components/HomeScreen/RecentTransactions';
import MonthlyOverview from '../../../components/HomeScreen/MonthlyOverview';

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

    const currency = user?.currency;
    const firstName = user?.firstName;
    const currencySymbol = user?.currency_symbol ?? "₹";
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const isRefreshing = useRef(false);
    const lastRefresh = useRef(0);

    const {
        data: accounts = [],
        isLoading: accountsLoading,
        isRefetching: accountsRefetching,
        refetch: refetchAccounts,
    } = useAccountsQuery();

    const {
        data: transactions = [],
        isLoading: transactionsLoading,
        isRefetching: transactionsRefetching,
        refetch: refetchTransactions,
    } = useTransactionsQuery();

    const { data: budget = null,
        refetch: refetchBudget
    } = useBudgetQuery();

    const loading = accountsLoading || transactionsLoading
    const refreshing = accountsRefetching || transactionsRefetching

    // useEffect(() => {
    //     console.log("Accounts:", accounts);
    //     console.log("Transactions:", transactions);
    //     console.log("Budget:", budget);
    // }, [accounts, transactions, budget]);;

    const onRefresh = async () => {
        const now = Date.now();

        if (isRefreshing.current || now - lastRefresh.current < 10000) {
            return;
        }

        isRefreshing.current = true;
        lastRefresh.current = now;

        try {
            await Promise.all([
                refetchAccounts(),
                refetchTransactions(),
                refetchBudget(),
            ]);
        } finally {
            isRefreshing.current = false;
        }
    };

    const totalBalance = useMemo(
        () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
        [accounts]
    );

    const monthTransactions = useMemo(() => {
        const now = new Date();

        return transactions.filter((tx) => isSameMonth(new Date(tx.date), now));
    }, [transactions]);

    const monthIncome = useMemo(
        () =>
            monthTransactions
                .filter((tx) => tx.type === "INCOME")
                .reduce((sum, tx) => sum + Number(tx.amount), 0),
        [monthTransactions]
    );

    const monthExpense = useMemo(
        () =>
            monthTransactions
                .filter((tx) => tx.type === "EXPENSE")
                .reduce((sum, tx) => sum + Number(tx.amount), 0),
        [monthTransactions]
    );

    const recentTransactions = useMemo(
        () => transactions.slice(0, 5),
        [transactions]
    );

    const expenseBreakdown = useMemo(() => {
        const map: Record<string, number> = {};

        monthTransactions
            .filter((tx) => tx.type === "EXPENSE")
            .forEach((tx) => {
                map[tx.category] = (map[tx.category] ?? 0) + Number(tx.amount);
            });

        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => ({
                category: category as Transaction["category"],
                amount,
                color: getCategoryConfig(category as Transaction["category"]).color,
            }));
    }, [monthTransactions]);


    return (
        <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
            <ScrollView
                className="flex-1 bg-[#F8F8F7]"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <HomeHeader
                    isBalanceVisible={isBalanceVisible}
                    onToggleVisibility={() => setIsBalanceVisible(prev => !prev)}
                />
                <BalanceCard
                    totalBalance={totalBalance}
                    currencySymbol={currencySymbol}
                    budget={budget}
                    monthExpense={monthExpense}
                    isBalanceVisible={isBalanceVisible}
                />

                <MonthlyOverview
                    income={monthIncome}
                    expense={monthExpense}
                    currencySymbol={currencySymbol}
                    isBalanceVisible={isBalanceVisible}
                />
                <QuickActions actions={QUICK_ACTIONS} />
                <AIPromptBar />
                <ExpenseBreakdown
                    data={expenseBreakdown}
                    currencySymbol={currencySymbol}
                    isBalanceVisible={isBalanceVisible}
                />
                <RecentTransactions
                    transactions={recentTransactions}
                    currencySymbol={currencySymbol}
                    isBalanceVisible={isBalanceVisible}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen