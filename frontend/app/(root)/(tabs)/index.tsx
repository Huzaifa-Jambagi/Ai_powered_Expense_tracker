import { Link } from 'expo-router'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { userStorage } from '../../../lib/store';
import { useTransactionsQuery } from '../../../hooks/useTransactionsQuery';
import { useBudgetQuery } from '../../../hooks/useBudgetQuery';
import { useAccountsQuery } from '../../../hooks/useAccounts';
import { useEffect, useMemo, useState } from 'react';
import { isSameMonth } from 'date-fns'
import { getCategoryConfig } from '../../../constants/catogories';
import { type Transaction } from '../../../apis/transactionApis';

export const QUICK_ACTIONS = [
    {
        icon: "camera",
        label: "AI Receipt Scan",
        action: "scan",
        color: "#1A85FF",
    },
    {
        icon: "mic",
        label: "Voice Entry",
        action: "voice",
        color: "#FF6B4A"
    },
    {
        icon: "plus",
        label: "Add Manually",
        action: "manual",
        color: "#3DDC84"
    },
] as const;

const HomeScreen = () => {
    const user = userStorage.getUser();

    const currency = user?.currency;
    const firstName = user?.firstName;
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);

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

    useEffect(() => {
        console.log("Accounts:", accounts);
        console.log("Transactions:", transactions);
        console.log("Budget:", budget);
    }, [accounts, transactions, budget]);

    const onRefresh = async () => {
        await Promise.all([
            refetchAccounts(),
            refetchTransactions(),
            refetchBudget(),
        ]);
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
                className="flex-1 bg-brand-body"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen