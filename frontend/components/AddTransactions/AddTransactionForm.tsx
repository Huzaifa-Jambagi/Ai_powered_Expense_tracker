import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";

import ReceiptScan from "../../assets/receipt-scan.svg";
import VoiceEntry from "../../assets/voice-entry.svg";
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../constants/catogories";
import { userStorage } from "../../lib/store";
import type { Account } from "../../apis/accountApis";
import type { AddTransactionPayload } from "../../apis/transactionApis";
import { useAccountsQuery } from "../../hooks/useAccounts";
import { useAddTransactionMutation } from "../../hooks/useAddTransactionMutation";
import { addTransactionSchema, type AddTransactionFormValues } from "./addTransactionSchema";
import CategoryPickerModal from "./CategoryPickerModal";
import TransactionDatePicker from "./TransactionDatePicker";
import ReceiptCameraModal from "./ReceiptCameraModal";
import VoiceRecordingModal from "./VoiceRecordingModal";

import type { ExtractedTransaction } from "../../service/transactionAi";
import { useReceiptEntry } from "../../hooks/useReceiptEntry";
import { useVoiceEntry } from "../../hooks/useVoiceEntry";

type TransactionType = AddTransactionFormValues["type"];

const EMPTY_ACCOUNTS: Account[] = [];
const EXPENSE_COLOR = "#E11D48";
const GREEN_COLOR = "#15803D";
const INPUT_ROW_CLASS = "h-16 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4";
const CATEGORIES_BY_TYPE = { EXPENSE: EXPENSE_CATEGORIES, INCOME: INCOME_CATEGORIES };

const TYPE_OPTIONS = [
    { value: "EXPENSE", label: "Expense", icon: "arrow-down", color: EXPENSE_COLOR, activeClass: "bg-rose-600" },
    { value: "INCOME", label: "Income", icon: "trending-up", color: GREEN_COLOR, activeClass: "bg-green-800" },
] as const;

const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

const getTransactionTimestamp = (date: Date) => {
    const now = new Date();
    const transactionDate = new Date(date);
    transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    return transactionDate.toISOString();
};

function QuickEntryCard({ title, subtitle, className, onPress, disabled, children }: {
    title: string;
    subtitle: string;
    className: string;
    onPress: () => void;
    disabled: boolean;
    children: ReactNode;
}) {
    return (
        <Pressable onPress={onPress} disabled={disabled} className="flex-1">
            <View className={`min-h-[168px] items-center rounded-[24px] border p-3.5 ${className}`}>
                {children}
                <Text numberOfLines={1} className="mt-1 w-full text-center text-lg font-bold text-slate-950">
                    {title}
                </Text>
                <Text className="mt-1 text-center text-xs text-slate-600">{subtitle}</Text>
            </View>
        </Pressable>
    );
}

function TransactionTypeToggle({ value, onChange }: {
    value: TransactionType;
    onChange: (value: TransactionType) => void;
}) {
    return (
        <View className="mb-6 flex-row rounded-2xl border border-gray-200 bg-white p-1">
            {TYPE_OPTIONS.map((option) => {
                const active = option.value === value;

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${active ? option.activeClass : ""}`}
                    >
                        <Feather name={option.icon} size={19} color={active ? "#FFFFFF" : option.color} />
                        <Text className={`text-base font-bold ${active ? "text-white" : "text-slate-950"}`}>
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function AddTransactionForm() {
    const router = useRouter();
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [inputMethod, setInputMethod] = useState<AddTransactionPayload["input_method"]>("manual");
    const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
    const { mode } = useLocalSearchParams<{ mode?: "scan" | "voice" | "manual" }>();
    const handledModeRef = useRef<string | null>(null);

    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";
    const { data: accounts = EMPTY_ACCOUNTS, isLoading: accountsLoading } = useAccountsQuery();
    const addTransaction = useAddTransactionMutation();

    const { control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<AddTransactionFormValues>({
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
    const selectedColor = isExpense ? EXPENSE_COLOR : GREEN_COLOR;
    const categoryDetails = CATEGORIES[selectedCategory];

    const applyExtractedTransaction = useCallback((extracted: ExtractedTransaction, method: "scan" | "mic") => {
        const nextType: TransactionType = method === "scan"
            ? "EXPENSE"
            : extracted.type ?? (extracted.category ? CATEGORIES[extracted.category].type : getValues("type"));

        const currentCategory = getValues("category");
        const suggestedCategory = extracted.category && CATEGORIES[extracted.category].type === nextType
            ? extracted.category
            : null;

        const nextCategory = suggestedCategory ?? (
            CATEGORIES[currentCategory].type === nextType ? currentCategory : CATEGORIES_BY_TYPE[nextType][0].key
        );

        setValue("type", nextType, { shouldValidate: true });
        setValue("category", nextCategory, { shouldValidate: true });

        if (extracted.amount !== null) setValue("amount", String(extracted.amount), { shouldValidate: true });
        if (extracted.description !== null) setValue("description", extracted.description, { shouldValidate: true });

        if (extracted.date !== null) {
            const date = parseLocalDate(extracted.date);
            if (date) setValue("date", date, { shouldValidate: true });
        }

        setInputMethod(method);
        setVoiceTranscript(method === "mic" ? extracted.transcript : null);
    }, [getValues, setValue]);

    const handleReceiptExtracted = useCallback((extracted: ExtractedTransaction) => {
        applyExtractedTransaction(extracted, "scan");
        Alert.alert("Receipt scanned", "Transaction details were filled in. Review them before saving.");
    }, [applyExtractedTransaction]);

    const handleVoiceExtracted = useCallback((extracted: ExtractedTransaction) => {
        applyExtractedTransaction(extracted, "mic");
        Alert.alert("Voice entry completed", "Transaction details were filled in. Review them before saving.");
    }, [applyExtractedTransaction]);

    const receiptEntry = useReceiptEntry(handleReceiptExtracted);
    const voiceEntry = useVoiceEntry(handleVoiceExtracted);

    const isBusy = receiptEntry.isProcessing || voiceEntry.isProcessing || voiceEntry.isRecording || addTransaction.isPending;
    const isSaveDisabled = isBusy || accountsLoading || accounts.length === 0;

    useEffect(() => {
        if (!mode || mode === "manual") {
            handledModeRef.current = null;
            return;
        }

        if (handledModeRef.current === mode) return;

        handledModeRef.current = mode;
        router.setParams({ mode: "manual" });

        if (mode === "scan") void receiptEntry.openCamera();
        if (mode === "voice") void voiceEntry.startRecording();
    }, [mode, router, receiptEntry.openCamera, voiceEntry.startRecording]);

    useEffect(() => {
        if (!accounts.length || selectedAccountId) return;

        const defaultAccount = accounts.find((account) => account.is_default) ?? accounts[0];
        setValue("accountId", defaultAccount.id, { shouldValidate: true });
    }, [accounts, selectedAccountId, setValue]);

    const handleTypeChange = (nextType: TransactionType) => {
        setValue("type", nextType, { shouldValidate: true });
        setValue("category", CATEGORIES_BY_TYPE[nextType][0].key, { shouldValidate: true });
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
                input_method: inputMethod,
                voice_transcript: inputMethod === "mic" ? voiceTranscript : null,
            });

            Alert.alert("Transaction added", "Your transaction was saved successfully.", [
                { text: "OK", onPress: () => router.replace("/transactions") },
            ]);
        } catch {
            Alert.alert("Transaction failed", "Your transaction couldn't be saved. Please try again.");
        }
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <ReceiptCameraModal
                visible={receiptEntry.cameraVisible}
                onClose={receiptEntry.closeCamera}
                onCapture={receiptEntry.processImage}
            />
            <VoiceRecordingModal
                visible={voiceEntry.isModalVisible}
                isRecording={voiceEntry.isRecording}
                isProcessing={voiceEntry.isProcessing}
                onStop={voiceEntry.stopRecording}
                onCancel={voiceEntry.cancelRecording}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
            >
                <View className="mb-6 flex-row gap-3">
                    <QuickEntryCard
                        title="Scan Receipt"
                        subtitle={receiptEntry.isProcessing ? "Reading receipt…" : "Snap and auto-fill details"}
                        className="border-[#F9C6D8] bg-[#FFF0F4]"
                        onPress={receiptEntry.openCamera}
                        disabled={isBusy}
                    >
                        {receiptEntry.isProcessing
                            ? <ActivityIndicator size="large" color={EXPENSE_COLOR} className="h-[76px]" />
                            : <ReceiptScan width={78} height={76} />}
                    </QuickEntryCard>

                    <QuickEntryCard
                        title="Voice Entry"
                        subtitle="Speak to add a transaction"
                        className="border-[#DCCBFF] bg-[#F4F0FF]"
                        onPress={voiceEntry.startRecording}
                        disabled={isBusy}
                    >
                        {voiceEntry.isProcessing
                            ? <ActivityIndicator size="large" color="#7C3AED" className="h-[76px]" />
                            : <VoiceEntry width={78} height={76} />}
                    </QuickEntryCard>
                </View>

                <TransactionTypeToggle value={type} onChange={handleTypeChange} />

                <View className="mb-6">
                    <Text className="mb-2 text-base font-bold text-slate-950">Amount</Text>
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { value, onChange, onBlur } }) => (
                            <View className={INPUT_ROW_CLASS}>
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
                    {!!errors.amount?.message && <Text className="mt-1.5 text-xs text-red-500">{errors.amount.message}</Text>}
                </View>

                <View className="mb-6">
                    <Text className="mb-2 text-base font-bold text-slate-950">Category</Text>
                    <Pressable
                        onPress={() => setCategoryModalVisible(true)}
                        className="h-14 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4"
                    >
                        <View className="flex-row items-center gap-3">
                            <Text>{categoryDetails.icon}</Text>
                            <Text className="text-sm font-medium text-slate-950">{categoryDetails.label}</Text>
                        </View>
                        <Feather name="chevron-down" size={20} color="#64748B" />
                    </Pressable>
                    {!!errors.category?.message && <Text className="mt-1.5 text-xs text-red-500">{errors.category.message}</Text>}
                </View>

                <CategoryPickerModal
                    visible={categoryModalVisible}
                    title={`${isExpense ? "Expense" : "Income"} Category`}
                    categories={CATEGORIES_BY_TYPE[type]}
                    selectedKey={selectedCategory}
                    selectedColor={selectedColor}
                    onSelect={(key) => setValue("category", key, { shouldValidate: true })}
                    onClose={() => setCategoryModalVisible(false)}
                />

                <View className="mb-6">
                    <Text className="mb-2 text-base font-bold text-slate-950">Account</Text>
                    {accountsLoading ? (
                        <ActivityIndicator color={GREEN_COLOR} className="self-start" />
                    ) : accounts.length === 0 ? (
                        <Text className="text-sm text-gray-500">No accounts available. Create an account first.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
                            {accounts.map((account) => {
                                const selected = selectedAccountId === account.id;

                                return (
                                    <Pressable
                                        key={account.id}
                                        onPress={() => setValue("accountId", account.id, { shouldValidate: true })}
                                        className="rounded-full border px-5 py-3"
                                        style={{
                                            backgroundColor: selected ? GREEN_COLOR : "#FFFFFF",
                                            borderColor: selected ? GREEN_COLOR : "#E5E7EB",
                                        }}
                                    >
                                        <Text className={`text-sm font-medium ${selected ? "text-white" : "text-slate-950"}`}>
                                            {account.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    )}
                    {!!errors.accountId?.message && <Text className="mt-1.5 text-xs text-red-500">{errors.accountId.message}</Text>}
                </View>

                <Controller
                    control={control}
                    name="date"
                    render={({ field: { value, onChange } }) => <TransactionDatePicker value={value} onChange={onChange} />}
                />

                <View className="mb-8">
                    <Text className="mb-2 text-base font-bold text-slate-950">Description (optional)</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { value, onChange, onBlur } }) => (
                            <View className={INPUT_ROW_CLASS}>
                                <Feather name="edit-2" size={21} color={GREEN_COLOR} />
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
                    {!!errors.description?.message && <Text className="mt-1.5 text-xs text-red-500">{errors.description.message}</Text>}
                </View>

                <Pressable
                    onPress={onSubmit}
                    disabled={isSaveDisabled}
                    className={`h-16 flex-row items-center justify-center rounded-2xl bg-green-800 ${isSaveDisabled ? "opacity-70" : "active:bg-green-900"}`}
                >
                    {addTransaction.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-lg font-bold text-white">Save Transaction</Text>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}