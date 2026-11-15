import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, subMonths } from "date-fns";

import type { TransactionFilters, TransactionType } from "../../apis/transactionApis";
import { useAccountsQuery } from "../../hooks/useAccounts";
import TransactionsMonthPicker from "./TransactionsMonthPicker";

type TransactionsFilterModalProps = {
    visible: boolean;
    filters: TransactionFilters;
    onClose: () => void;
    onApply: (filters: TransactionFilters) => void;
};

const PRIMARY_COLOR = "#006B38";
const ACCENT_COLOR = "#E6004C";

const getCurrentMonth = () => format(new Date(), "yyyy-MM");

const getMonthLabel = (month: string) => {
    const [year, monthNumber] = month.split("-").map(Number);
    return format(new Date(year, monthNumber - 1, 1), "MMMM yyyy");
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(new Date(), index);

    return {
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
    };
});

const TRANSACTION_TYPES: { label: string; value?: TransactionType }[] = [
    { label: "All" },
    { label: "Income", value: "INCOME" },
    { label: "Expense", value: "EXPENSE" },
];

export default function TransactionsFilterModal({
    visible,
    filters,
    onClose,
    onApply,
}: TransactionsFilterModalProps) {
    const { data: accounts = [], isLoading: isAccountsLoading } = useAccountsQuery();

    const [draftFilters, setDraftFilters] = useState<TransactionFilters>(filters);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pendingMonth, setPendingMonth] = useState(filters.month);

    useEffect(() => {
        if (visible) {
            setDraftFilters(filters);
            setPendingMonth(filters.month);
            setIsMonthPickerOpen(false);
        }
    }, [visible, filters]);

    const selectedMonthLabel = useMemo(
        () => getMonthLabel(draftFilters.month),
        [draftFilters.month]
    );

    const openMonthPicker = () => {
        setPendingMonth(draftFilters.month);
        setIsMonthPickerOpen(true);
    };

    const selectMonth = () => {
        setDraftFilters((current) => ({
            ...current,
            month: pendingMonth,
        }));

        setIsMonthPickerOpen(false);
    };

    const selectType = (type?: TransactionType) => {
        setDraftFilters((current) => ({
            ...current,
            type,
        }));
    };

    const selectAccount = (accountId?: string) => {
        setDraftFilters((current) => ({
            ...current,
            accountId,
        }));
    };

    const resetFilters = () => {
        const defaults = { month: getCurrentMonth() };

        setDraftFilters(defaults);
        setPendingMonth(defaults.month);
    };

    const applyFilters = () => {
        onApply(draftFilters);
    };

    const isTypeSelected = (type?: TransactionType) => draftFilters.type === type;
    const isAccountSelected = (accountId?: string) => draftFilters.accountId === accountId;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <Pressable
                    className="absolute inset-0"
                    onPress={onClose}
                />

                <SafeAreaView
                    edges={["bottom"]}
                    className="max-h-[90%] rounded-t-[24px] bg-white"
                >
                    {/* Modal header */}
                    <View className="items-center px-5 pt-3">
                        <View className="h-1.5 w-10 rounded-full bg-gray-400" />

                        <View className="mt-4 h-11 w-full flex-row items-center">
                            <Pressable
                                onPress={
                                    isMonthPickerOpen
                                        ? () => setIsMonthPickerOpen(false)
                                        : onClose
                                }
                                hitSlop={10}
                                className="h-10 w-10 items-center justify-center"
                            >
                                <Feather name="x" size={25} color="#0F172A" />
                            </Pressable>

                            <Text className="flex-1 text-center text-xl font-bold text-slate-950">
                                {isMonthPickerOpen ? "Select Month" : "Filter Transactions"}
                            </Text>

                            <View className="h-10 w-10" />
                        </View>
                    </View>

                    {isMonthPickerOpen ? (
                        <TransactionsMonthPicker
                            selectedMonth={pendingMonth}
                            onSelectMonth={setPendingMonth}
                            onConfirm={selectMonth}
                        />
                    ) : (
                        <>
                            <ScrollView
                                className="mt-4"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 6,
                                }}
                            >
                                {/* Period */}
                                <View>
                                    <View className="mb-3 flex-row items-center gap-3">
                                        <Feather name="calendar" size={22} color="#0F172A" />

                                        <Text className="text-base font-bold text-slate-950">
                                            Period
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={openMonthPicker}
                                        className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-4"
                                    >
                                        <Feather name="calendar" size={20} color="#64748B" />

                                        <Text className="ml-3 flex-1 text-base font-medium text-slate-950">
                                            {selectedMonthLabel}
                                        </Text>

                                        <Feather name="chevron-down" size={21} color="#0F172A" />
                                    </Pressable>
                                </View>

                                <View className="my-6 h-px bg-gray-100" />

                                {/* Transaction Type */}
                                <View>
                                    <View className="mb-4 flex-row items-center gap-3">
                                        <Feather name="refresh-cw" size={21} color="#0F172A" />

                                        <Text className="text-base font-bold text-slate-950">
                                            Transaction Type
                                        </Text>
                                    </View>

                                    <View className="flex-row gap-2">
                                        {TRANSACTION_TYPES.map((type) => {
                                            const selected = isTypeSelected(type.value);

                                            return (
                                                <Pressable
                                                    key={type.label}
                                                    onPress={() => selectType(type.value)}
                                                    className={`flex-1 items-center justify-center rounded-full border py-3 ${selected
                                                            ? "border-green-600 bg-green-600"
                                                            : "border-gray-200 bg-white"
                                                        }`}
                                                >
                                                    <Text
                                                        className={`text-sm font-medium ${selected
                                                                ? "text-white"
                                                                : "text-slate-950"
                                                            }`}
                                                    >
                                                        {type.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View className="my-6 h-px bg-gray-100" />

                                {/* Account */}
                                <View>
                                    <View className="mb-4 flex-row items-center gap-3">
                                        <Feather name="credit-card" size={21} color="#0F172A" />

                                        <Text className="text-base font-bold text-slate-950">
                                            Account
                                        </Text>
                                    </View>

                                    <View className="flex-row flex-wrap gap-2">
                                        <Pressable
                                            onPress={() => selectAccount()}
                                            className={`rounded-full border px-4 py-3 ${isAccountSelected()
                                                    ? "border-green-600 bg-green-600"
                                                    : "border-gray-200 bg-white"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${isAccountSelected()
                                                        ? "text-white"
                                                        : "text-slate-950"
                                                    }`}
                                            >
                                                All Accounts
                                            </Text>
                                        </Pressable>

                                        {accounts.map((account) => {
                                            const selected = isAccountSelected(account.id);

                                            return (
                                                <Pressable
                                                    key={account.id}
                                                    onPress={() => selectAccount(account.id)}
                                                    className={`rounded-full border px-4 py-3 ${selected
                                                            ? "border-green-600 bg-green-600"
                                                            : "border-gray-200 bg-white"
                                                        }`}
                                                >
                                                    <Text
                                                        className={`text-sm font-medium ${selected
                                                                ? "text-white"
                                                                : "text-slate-950"
                                                            }`}
                                                    >
                                                        {account.name}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    {isAccountsLoading && (
                                        <ActivityIndicator
                                            size="small"
                                            color={PRIMARY_COLOR}
                                            className="mt-4 self-start"
                                        />
                                    )}

                                    {!isAccountsLoading && accounts.length === 0 && (
                                        <Text className="mt-3 text-sm text-gray-500">
                                            No accounts available.
                                        </Text>
                                    )}
                                </View>
                            </ScrollView>

                            {/* Footer actions */}
                            <View className="flex-row gap-3 border-t border-gray-100 px-5 py-4">
                                <Pressable
                                    onPress={applyFilters}
                                    className="h-12 flex-1 items-center justify-center rounded-xl bg-green-700 active:bg-green-750"
                                >
                                    <Text className="text-base font-bold text-white">
                                        Apply Filters
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={resetFilters}
                                    className="h-12 w-28 items-center justify-center rounded-xl  bg-rose-600 active:bg-rose-200"
                                >
                                    <Text className="text-base font-bold text-white">
                                        Reset
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
}