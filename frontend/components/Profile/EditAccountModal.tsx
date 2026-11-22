import { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Account, UpdateAccountInput } from "../../apis/accountApis";

const accountTypes = [
    { value: "CASH", label: "Cash", icon: "💵" },
    { value: "BANK", label: "Bank", icon: "🏦" },
    { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
    { value: "OTHER", label: "Other", icon: "💼" },
] as const;

const editAccountSchema = z.object({
    name: z.string().trim().min(1, "Account name is required").max(50, "Name is too long"),
    type: z.enum(["CASH", "BANK", "CREDIT_CARD", "OTHER"]),
    balance: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid balance"),
});

export type EditAccountForm = z.infer<typeof editAccountSchema>;

type EditAccountModalProps = {
    visible: boolean;
    account: Account;
    onClose: () => void;
    onSubmit: (values: UpdateAccountInput) => Promise<unknown> | void;
};

export function EditAccountModal({ visible, account, onClose, onSubmit }: EditAccountModalProps) {
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditAccountForm>({
        resolver: zodResolver(editAccountSchema),
        defaultValues: { name: account.name, type: account.type, balance: String(account.balance) },
    });

    useEffect(() => {
        if (visible) reset({ name: account.name, type: account.type, balance: String(account.balance) });
    }, [visible, account, reset]);

    const submit = handleSubmit(values => {
        const input: UpdateAccountInput = {};

        if (values.name !== account.name) input.name = values.name;
        if (values.type !== account.type) input.type = values.type;

        const balanceChanged = Number(values.balance) !== Number(account.balance);

        if (balanceChanged) input.balance = values.balance;

        // Avoid an API request if nothing changed.
        if (!Object.keys(input).length) return onClose();

        const save = () => onSubmit(input);

        if (!balanceChanged) return save();

        Alert.alert(
            "Change Account Balance?",
            "Changing the account balance directly may make it inconsistent with your transaction history. Do you want to continue?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Continue", style: "destructive", onPress: save },
            ],
        );
    });

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <Pressable className="absolute inset-0" onPress={onClose} disabled={isSubmitting} />

                <KeyboardAvoidingView
                    className="flex-1 justify-end"
                    behavior="padding"
                >
                    <SafeAreaView
                        edges={["bottom"]}
                        className="max-h-[92%] overflow-hidden rounded-t-3xl bg-white"
                    >
                        <ScrollView
                            style={{ flexShrink: 1 }}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                        >
                            <View className="mb-4 items-center">
                                <View className="h-1.5 w-10 rounded-full bg-gray-300" />
                            </View>

                            <View className="mb-5 flex-row items-center justify-between">
                                <Text className="text-xl font-bold text-gray-900">Edit Account</Text>

                                <Pressable
                                    onPress={onClose}
                                    disabled={isSubmitting}
                                    className="rounded-full p-2 active:bg-gray-100"
                                >
                                    <Text className="text-lg text-gray-500">✕</Text>
                                </Pressable>
                            </View>

                            {/* Account Name */}
                            <Text className="mb-2 text-sm font-semibold text-gray-700">Account Name</Text>

                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholder="Account name"
                                        placeholderTextColor="#9CA3AF"
                                        returnKeyType="done"
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                        className="rounded-xl border border-gray-200 px-4 py-3.5 text-base text-gray-900"
                                    />
                                )}
                            />

                            {errors.name && (
                                <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
                            )}

                            {/* Account Type */}
                            <Text className="mb-3 mt-5 text-sm font-semibold text-gray-700">Account Type</Text>

                            <Controller
                                control={control}
                                name="type"
                                render={({ field: { value, onChange } }) => (
                                    <View className="flex-row flex-wrap gap-2">
                                        {accountTypes.map(type => {
                                            const selected = value === type.value;

                                            return (
                                                <Pressable
                                                    key={type.value}
                                                    onPress={() => onChange(type.value)}
                                                    className={`w-[48%] flex-row items-center justify-center gap-2 rounded-xl border py-3.5 ${selected ? "border-green-700 bg-green-50" : "border-gray-200 bg-white"
                                                        }`}
                                                >
                                                    <Text className="text-base">{type.icon}</Text>

                                                    <Text className={`text-sm font-semibold ${selected ? "text-green-800" : "text-gray-700"
                                                        }`}>
                                                        {type.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}
                            />

                            {/* Balance */}
                            <Text className="mb-2 mt-5 text-sm font-semibold text-gray-700">Current Balance</Text>

                            <Controller
                                control={control}
                                name="balance"
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="decimal-pad"
                                        placeholder="0"
                                        placeholderTextColor="#9CA3AF"
                                        className="rounded-xl border border-gray-200 px-4 py-3.5 text-base text-gray-900"
                                    />
                                )}
                            />

                            {errors.balance && (
                                <Text className="mt-1 text-xs text-red-500">{errors.balance.message}</Text>
                            )}

                            {/* Save */}
                            <Pressable
                                onPress={submit}
                                disabled={isSubmitting}
                                className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-green-700 py-4 active:bg-green-800"
                            >
                                {isSubmitting && <ActivityIndicator color="white" size="small" />}
                                <Text className="font-semibold text-white">
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}