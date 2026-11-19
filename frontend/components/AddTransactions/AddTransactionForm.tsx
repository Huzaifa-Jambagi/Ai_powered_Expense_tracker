import { useEffect, useRef, useState, type ReactNode } from "react";
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
import * as FileSystem from "expo-file-system/legacy";
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from "expo-audio";
import { useCameraPermissions } from "expo-camera";

import ReceiptScan from "../../assets/receipt-scan.svg";
import VoiceEntry from "../../assets/voice-entry.svg";
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../constants/catogories";
import { userStorage } from "../../lib/store";
import type { Account } from "../../apis/accountApis";
import type { AddTransactionPayload } from "../../apis/transactionApis";
import { useAccountsQuery } from "../../hooks/useAccounts";
import { addTransactionSchema, type AddTransactionFormValues } from "./addTransactionSchema";
import CategoryPickerModal from "./CategoryPickerModal";
import TransactionDatePicker from "./TransactionDatePicker";
import { useAddTransactionMutation } from "../../hooks/useAddTransactionMutation";
import ReceiptCameraModal from "./ReceiptCameraModal";
import {
    extractTransactionFromReceipt,
    extractTransactionFromVoice,
    type ExtractedTransaction,
} from "../../service/transactionAi";

type TransactionType = AddTransactionFormValues["type"];

const EMPTY_ACCOUNTS: Account[] = [];
const MAX_RECEIPT_IMAGE_SIZE = 12 * 1024 * 1024;
const MAX_VOICE_DURATION = 60_000;
const MAX_VOICE_FILE_SIZE = 10 * 1024 * 1024;
const VOICE_RECORDING_OPTIONS = { ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, bitRate: 64_000 };

type InputMethod = AddTransactionPayload["input_method"];

const parseLocalDate = (value: string): Date | null => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : null;
};

const hasTransactionDetails = (value: ExtractedTransaction) =>
    value.amount !== null || value.category !== null || value.description !== null || value.date !== null;
const EXPENSE_COLOR = "#E11D48";
const INCOME_COLOR = "#15803D";
const INPUT_ROW_CLASS = "h-16 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4";
const CATEGORIES_BY_TYPE = { EXPENSE: EXPENSE_CATEGORIES, INCOME: INCOME_CATEGORIES };

const TYPE_OPTIONS = [
    { value: "EXPENSE", label: "Expense", icon: "arrow-down", color: EXPENSE_COLOR, activeClass: "bg-rose-600" },
    { value: "INCOME", label: "Income", icon: "trending-up", color: INCOME_COLOR, activeClass: "bg-green-800" },
] as const;

const getTransactionTimestamp = (date: Date): string => {
    const now = new Date();
    const transactionDate = new Date(date);
    transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    return transactionDate.toISOString();
};

function QuickEntryCard({ title, subtitle, className, titleClassName, onPress, disabled, children, numberOfLines }: {
    title: string;
    subtitle: string;
    className: string;
    titleClassName?: string;
    onPress: () => void;
    disabled?: boolean;
    children: ReactNode;
    numberOfLines?: number;
}) {
    return (
        <Pressable onPress={onPress} disabled={disabled} className="flex-1">
            <View className={`min-h-[168px] items-center rounded-[24px] border p-3.5 ${className}`}>
                {children}
                <Text numberOfLines={numberOfLines} className={`mt-1 text-center text-lg font-bold text-slate-950 ${titleClassName ?? ""}`}>
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
    const [cameraVisible, setCameraVisible] = useState(false);
    const [isReceiptProcessing, setIsReceiptProcessing] = useState(false);
    const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
    const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
    const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const audioRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
    const recorderState = useAudioRecorderState(audioRecorder);
    const extractionInProgressRef = useRef(false);
    const voiceActionInProgressRef = useRef(false);

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
    const selectedColor = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
    const categoryDetails = CATEGORIES[selectedCategory];
    const isSaveDisabled =
        addTransaction.isPending || accountsLoading || accounts.length === 0 ||
        isReceiptProcessing || isVoiceProcessing || recorderState.isRecording;

    useEffect(() => {
        if (!accounts.length || selectedAccountId) return;
        const defaultAccount = accounts.find((account) => account.is_default) ?? accounts[0];
        setValue("accountId", defaultAccount.id, { shouldValidate: true });
    }, [accounts, selectedAccountId, setValue]);

    useEffect(() => () => {
        if (!audioRecorder.getStatus().isRecording) return;

        void (async () => {
            await audioRecorder.stop().catch(() => undefined);
            await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => undefined);
        })();
    }, [audioRecorder]);

    const applyExtractedTransaction = (extracted: ExtractedTransaction, method: "scan" | "mic") => {
        const nextType: TransactionType = method === "scan"
            ? "EXPENSE"
            : extracted.type ?? (extracted.category ? CATEGORIES[extracted.category].type : getValues("type"));
        const currentCategory = getValues("category");
        const suggestedCategory = extracted.category && CATEGORIES[extracted.category].type === nextType
            ? extracted.category
            : null;
        const nextCategory = suggestedCategory ?? (
            CATEGORIES[currentCategory].type === nextType
                ? currentCategory
                : CATEGORIES_BY_TYPE[nextType][0].key
        );

        setValue("type", nextType, { shouldDirty: true, shouldValidate: true });
        setValue("category", nextCategory, { shouldDirty: true, shouldValidate: true });

        if (extracted.amount !== null) setValue("amount", String(extracted.amount), { shouldDirty: true, shouldValidate: true });
        if (extracted.description !== null) setValue("description", extracted.description, { shouldDirty: true, shouldValidate: true });

        if (extracted.date !== null) {
            const date = parseLocalDate(extracted.date);
            if (date) setValue("date", date, { shouldDirty: true, shouldValidate: true });
        }

        setInputMethod(method);
        setVoiceTranscript(method === "mic" ? extracted.transcript : null);
    };

    const processReceiptImage = async (base64Image: string) => {
        if (extractionInProgressRef.current) return;

        extractionInProgressRef.current = true;
        setIsReceiptProcessing(true);

        try {
            if (base64Image.length * 0.75 > MAX_RECEIPT_IMAGE_SIZE) {
                throw new Error("That image is too large. Please capture a receipt smaller than 12 MB.");
            }

            const extracted = await extractTransactionFromReceipt(base64Image, "image/jpeg");

            if (!hasTransactionDetails(extracted)) {
                Alert.alert("Receipt not recognized", "Couldn't identify transaction details. Try a clearer receipt photo.");
                return;
            }

            applyExtractedTransaction(extracted, "scan");
            Alert.alert("Receipt scanned", "Transaction details were filled in. Review them before saving.");
        } catch (error) {
            Alert.alert("Receipt scanning failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            extractionInProgressRef.current = false;
            setIsReceiptProcessing(false);
        }
    };

    const openReceiptCamera = async () => {
        if (extractionInProgressRef.current || voiceActionInProgressRef.current || isVoiceProcessing || recorderState.isRecording || addTransaction.isPending) return;

        try {
            const permission = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();

            if (!permission.granted) {
                Alert.alert("Camera permission required", "Allow camera access to take a receipt photo.");
                return;
            }

            setCameraVisible(true);
        } catch {
            Alert.alert("Camera unavailable", "Couldn't request camera permission.");
        }
    };

    const handleVoiceEntry = async () => {
        if (voiceActionInProgressRef.current || extractionInProgressRef.current || isReceiptProcessing || addTransaction.isPending) return;

        voiceActionInProgressRef.current = true;
        let audioUriToDelete: string | null = null;

        try {
            if (!audioRecorder.getStatus().isRecording) {
                const permission = await AudioModule.requestRecordingPermissionsAsync();

                if (!permission.granted) {
                    Alert.alert("Microphone permission required", "Allow microphone access to use voice entry.");
                    return;
                }

                await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
                await audioRecorder.prepareToRecordAsync();
                audioRecorder.record();
                return;
            }

            const durationMillis = audioRecorder.getStatus().durationMillis;
            setIsVoiceProcessing(true);
            await audioRecorder.stop();
            await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });

            if (durationMillis < 700) throw new Error("The recording was too short. Please try again.");
            if (durationMillis > MAX_VOICE_DURATION) throw new Error("Please keep voice entries under 60 seconds.");

            const audioUri = audioRecorder.uri;
            if (!audioUri) throw new Error("Couldn't access the audio recording.");
            audioUriToDelete = audioUri;

            const fileInfo = await FileSystem.getInfoAsync(audioUri);
            if (fileInfo.exists && "size" in fileInfo && typeof fileInfo.size === "number" && fileInfo.size > MAX_VOICE_FILE_SIZE) {
                throw new Error("The recording is too large. Please record a shorter voice entry.");
            }

            const base64Audio = await FileSystem.readAsStringAsync(audioUri, { encoding: FileSystem.EncodingType.Base64 });
            if (!base64Audio) throw new Error("Couldn't read the audio recording.");

            const extracted = await extractTransactionFromVoice(base64Audio, "audio/m4a");

            if (!hasTransactionDetails(extracted)) {
                Alert.alert("Transaction not recognized", "Couldn't identify transaction details in that recording. Please try again.");
                return;
            }

            applyExtractedTransaction(extracted, "mic");
            Alert.alert("Voice entry completed", "Transaction details were filled in. Review them before saving.");
        } catch (error) {
            await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => undefined);
            Alert.alert("Voice entry failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            if (audioUriToDelete) await FileSystem.deleteAsync(audioUriToDelete, { idempotent: true }).catch(() => undefined);
            voiceActionInProgressRef.current = false;
            setIsVoiceProcessing(false);
        }
    };

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
            Alert.alert("Transaction failed", "Your transaction couldn't be saved. All optimistic changes have been reverted.");
        }
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <ReceiptCameraModal
                visible={cameraVisible}
                onClose={() => setCameraVisible(false)}
                onCapture={processReceiptImage}
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
                        subtitle={isReceiptProcessing ? "Reading receipt..." : "Snap and auto-fill details"}
                        className="border-[#F9C6D8] bg-[#FFF0F4]"
                        onPress={() => void openReceiptCamera()}
                        disabled={isReceiptProcessing || isVoiceProcessing || recorderState.isRecording || addTransaction.isPending}
                    >
                        {isReceiptProcessing ? <ActivityIndicator size="large" color={EXPENSE_COLOR} className="h-[76px]" /> : <ReceiptScan width={78} height={76} />}
                    </QuickEntryCard>
                    <QuickEntryCard
                        title={recorderState.isRecording ? "Stop Recording" : "Voice Entry"}
                        subtitle={isVoiceProcessing ? "Extracting transaction..." : recorderState.isRecording ? "Tap to stop · keep under 60 sec" : "Tap to start recording"}
                        className="border-[#DCCBFF] bg-[#F4F0FF]"
                        titleClassName="w-full"
                        onPress={() => void handleVoiceEntry()}
                        disabled={isReceiptProcessing || isVoiceProcessing || addTransaction.isPending}
                        numberOfLines={1}
                    >
                        {isVoiceProcessing ? <ActivityIndicator size="large" color="#7C3AED" className="h-[76px]" /> : <VoiceEntry width={78} height={76} />}
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
                    <Text className="mb-3 text-base font-bold text-slate-950">Category</Text>
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
                    <Text className="mb-3 text-base font-bold text-slate-950">Account</Text>
                    {accountsLoading ? (
                        <ActivityIndicator color={INCOME_COLOR} className="self-start" />
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
                                            backgroundColor: selected ? INCOME_COLOR : "#FFFFFF",
                                            borderColor: selected ? INCOME_COLOR : "#E5E7EB",
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
