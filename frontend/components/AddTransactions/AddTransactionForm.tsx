import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";

import ReceiptScan from "../../assets/receipt-scan.svg";
import VoiceEntry from "../../assets/voice-entry.svg";

import {
    CATEGORIES,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
} from "../../constants/catogories";

import { userStorage } from "../../lib/store";
import type { Account } from "../../apis/accountApis";
import { useAccountsQuery } from "../../hooks/useAccounts";

import {
    addTransactionSchema,
    type AddTransactionFormValues,
} from "./addTransactionSchema";

import CategoryPickerModal from "./CategoryPickerModal";
import TransactionDatePicker from "./TransactionDatePicker";
import { useAddTransactionMutation } from "../../hooks/useAddTransactionMutation";

const EMPTY_ACCOUNTS: Account[] = [];

const EXPENSE_COLOR = "#E11D48";
const INCOME_COLOR = "#15803D";

const getTransactionTimestamp = (selectedDate: Date): string => {
    const now = new Date();
    const transactionDate = new Date(selectedDate);

    transactionDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
    );

    return transactionDate.toISOString();
};

export default function AddTransactionForm() {
    const router = useRouter();

    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";

    const { data: accounts = EMPTY_ACCOUNTS, isLoading: accountsLoading } = useAccountsQuery();
    const addTransaction = useAddTransactionMutation();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<AddTransactionFormValues>({
        resolver: zodResolver(addTransactionSchema),
        defaultValues: {
            type: "EXPENSE",
            amount: "",
            category: EXPENSE_CATEGORIES[0].key,
            accountId: "",
            date: new Date(),
            description: "",
        },
    });

    const type = useWatch({ control, name: "type" });
    const selectedCategory = useWatch({ control, name: "category" });
    const selectedAccountId = useWatch({ control, name: "accountId" });

    const isExpense = type === "EXPENSE";
    const selectedColor = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
    const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const categoryDetails = CATEGORIES[selectedCategory];

    const isSaveDisabled =
        addTransaction.isPending ||
        accountsLoading ||
        accounts.length === 0;

    // Select the default account once account data becomes available.
    useEffect(() => {
        if (!accounts.length || selectedAccountId) return;

        const defaultAccount = accounts.find((account) => account.is_default) ?? accounts[0];

        setValue("accountId", defaultAccount.id, { shouldValidate: true });
    }, [accounts, selectedAccountId, setValue]);

    const handleTypeChange = (nextType: "EXPENSE" | "INCOME") => {
        const nextCategories = nextType === "EXPENSE"
            ? EXPENSE_CATEGORIES
            : INCOME_CATEGORIES;

        setValue("type", nextType, { shouldValidate: true });
        setValue("category", nextCategories[0].key, { shouldValidate: true });
    };

    const onSubmit = handleSubmit(async (values) => {
        try {
            await addTransaction.mutateAsync({
                accountId: values.accountId,
                type: values.type,
                amount: values.amount,
                category: values.category,
                description: values.description.trim() || null,
                date: getTransactionTimestamp(values.date),
                input_method: "manual",
                voice_transcript: null,
            });

            Alert.alert(
                "Transaction added",
                "Your transaction was saved successfully.",
                [{ text: "OK", onPress: () => router.replace("/transactions") }],
            );
        } catch {
            Alert.alert(
                "Transaction failed",
                "Your transaction couldn't be saved. All optimistic changes have been reverted.",
            );
        }
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
            >
                {/* Receipt and voice entry */}
                <View className="mb-6 flex-row gap-3">
                    <Pressable
                        onPress={() => Alert.alert("Coming soon", "Receipt scanning will be available soon.")}
                        className="flex-1"
                    >
                        <View className="min-h-[168px] items-center rounded-[24px] border border-[#F9C6D8] bg-[#FFF0F4] p-3.5">
                            <ReceiptScan width={78} height={76} />

                            <Text className="mt-1 text-center text-lg font-bold text-slate-950">
                                Scan Receipt
                            </Text>

                            <Text className="mt-1 text-center text-xs text-slate-600">
                                Snap and auto-fill details
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => Alert.alert("Coming soon", "Voice entry will be available soon.")}
                        className="flex-1"
                    >
                        <View className="min-h-[168px] items-center rounded-[24px] border border-[#DCCBFF] bg-[#F4F0FF] p-3.5">
                            <VoiceEntry width={78} height={76} />

                            <Text numberOfLines={1} className="mt-1 w-full text-center text-lg font-bold text-slate-950">
                                Voice Entry
                            </Text>

                            <Text className="mt-1 text-center text-xs text-slate-600">
                                Just say it and we'll add it
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* Expense / Income */}
                <View className="mb-6 flex-row rounded-2xl border border-gray-200 bg-white p-1">
                    <Pressable
                        onPress={() => handleTypeChange("EXPENSE")}
                        className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${isExpense ? "bg-rose-600" : ""
                            }`}
                    >
                        <Feather
                            name="arrow-down"
                            size={19}
                            color={isExpense ? "#FFFFFF" : EXPENSE_COLOR}
                        />

                        <Text
                            className={`text-base font-bold ${isExpense ? "text-white" : "text-slate-950"
                                }`}
                        >
                            Expense
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => handleTypeChange("INCOME")}
                        className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${!isExpense ? "bg-green-800" : ""
                            }`}
                    >
                        <Feather
                            name="trending-up"
                            size={19}
                            color={!isExpense ? "#FFFFFF" : INCOME_COLOR}
                        />

                        <Text
                            className={`text-base font-bold ${!isExpense ? "text-white" : "text-slate-950"
                                }`}
                        >
                            Income
                        </Text>
                    </Pressable>
                </View>

                {/* Amount */}
                <View className="mb-6">
                    <Text className="mb-2 text-base font-bold text-slate-950">
                        Amount
                    </Text>

                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { value, onChange, onBlur } }) => (
                            <View className="h-16 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
                                <Text className="mr-3 text-xl font-semibold" style={{ color: selectedColor }}>
                                    {currencySymbol}
                                </Text>

                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="0"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="decimal-pad"
                                    className="flex-1 text-lg font-medium text-slate-950"
                                />
                            </View>
                        )}
                    />

                    {errors.amount && (
                        <Text className="mt-1.5 text-xs text-red-500">
                            {errors.amount.message}
                        </Text>
                    )}
                </View>

                {/* Category */}
                <View className="mb-6">
                    <Text className="mb-3 text-base font-bold text-slate-950">
                        Category
                    </Text>

                    <Pressable
                        onPress={() => setCategoryModalVisible(true)}
                        className="h-14 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4"
                    >
                        <View className="flex-row items-center gap-3">
                            <Text>{categoryDetails.icon}</Text>

                            <Text className="text-sm font-medium text-slate-950">
                                {categoryDetails.label}
                            </Text>
                        </View>

                        <Feather name="chevron-down" size={20} color="#64748B" />
                    </Pressable>

                    {errors.category && (
                        <Text className="mt-1.5 text-xs text-red-500">
                            {errors.category.message}
                        </Text>
                    )}
                </View>

                <CategoryPickerModal
                    visible={categoryModalVisible}
                    title={`${isExpense ? "Expense" : "Income"} Category`}
                    categories={categories}
                    selectedKey={selectedCategory}
                    selectedColor={selectedColor}
                    onSelect={(key) => setValue("category", key, { shouldValidate: true })}
                    onClose={() => setCategoryModalVisible(false)}
                />

                {/* Account */}
                <View className="mb-6">
                    <Text className="mb-3 text-base font-bold text-slate-950">
                        Account
                    </Text>

                    {accountsLoading ? (
                        <ActivityIndicator color={INCOME_COLOR} className="self-start" />
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                        >
                            {accounts.map((account) => {
                                const selected = selectedAccountId === account.id;

                                return (
                                    <Pressable
                                        key={account.id}
                                        onPress={() => setValue("accountId", account.id, { shouldValidate: true })}
                                        className="rounded-full border px-5 py-3"
                                        style={{
                                            backgroundColor: selected ? INCOME_COLOR : "#FFFFFF",
                                            borderColor: selected ? INCOME_COLOR : "#E5E7EB",
                                        }}
                                    >
                                        <Text
                                            className={`text-sm font-medium ${selected ? "text-white" : "text-slate-950"
                                                }`}
                                        >
                                            {account.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    )}

                    {!accountsLoading && accounts.length === 0 && (
                        <Text className="text-sm text-gray-500">
                            No accounts available. Create an account first.
                        </Text>
                    )}

                    {errors.accountId && (
                        <Text className="mt-1.5 text-xs text-red-500">
                            {errors.accountId.message}
                        </Text>
                    )}
                </View>

                {/* Date */}
                <Controller
                    control={control}
                    name="date"
                    render={({ field: { value, onChange } }) => (
                        <TransactionDatePicker value={value} onChange={onChange} />
                    )}
                />

                {/* Description */}
                <View className="mb-8">
                    <Text className="mb-2 text-base font-bold text-slate-950">
                        Description (optional)
                    </Text>

                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { value, onChange, onBlur } }) => (
                            <View className="h-16 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
                                <Feather name="edit-2" size={21} color={INCOME_COLOR} />

                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="e.g. Swiggy order"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={255}
                                    className="ml-4 flex-1 text-base text-slate-950"
                                />
                            </View>
                        )}
                    />

                    {errors.description && (
                        <Text className="mt-1.5 text-xs text-red-500">
                            {errors.description.message}
                        </Text>
                    )}
                </View>

                {/* Save */}
                <Pressable
                    onPress={onSubmit}
                    disabled={isSaveDisabled}
                    className={`h-16 flex-row items-center justify-center rounded-2xl bg-green-800 ${isSaveDisabled ? "opacity-70" : "active:bg-green-900"
                        }`}
                >
                    {addTransaction.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-lg font-bold text-white">
                            Save Transaction
                        </Text>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}