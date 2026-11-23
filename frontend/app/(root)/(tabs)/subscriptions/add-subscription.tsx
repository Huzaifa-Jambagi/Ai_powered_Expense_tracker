import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { format, parseISO } from "date-fns";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { z } from "zod";

import { userStorage } from "../../../../lib/store";
import CompanyPickerModal from "../../../../components/Subscriptions/CompanyPickerModal";
import { useCreateSubscriptionMutation } from "../../../../hooks/subscriptionMutation";
import PaymentBanner from "../../../../assets/subscriptions/subscription-payment-banner.svg";


const BILLING_INTERVAL_LIMITS = {
    DAY: 6,
    WEEK: 4,
    MONTH: 11,
    YEAR: 1,
} as const;

const schema = z.object({
    name: z.string().trim().min(1, "Subscription name is required").max(255),
    amount: z.string()
        .trim()
        .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
        .refine(value => Number(value) > 0, "Amount must be greater than zero"),
    billingInterval: z.string()
        .trim()
        .regex(/^[1-9]\d*$/, "Enter a valid interval")
        .transform(Number),
    billingUnit: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]),
    nextBillingDate: z.string().min(1, "Select your next billing date"),
}).superRefine(({ billingInterval, billingUnit }, ctx) => {
    const max = BILLING_INTERVAL_LIMITS[billingUnit];

    if (billingInterval > max) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["billingInterval"],
            message: `Maximum interval for ${billingUnit.toLowerCase()} is ${max}.`,
        });
    }
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

const units = [
    { label: "Day", value: "DAY" },
    { label: "Week", value: "WEEK" },
    { label: "Month", value: "MONTH" },
    { label: "Year", value: "YEAR" },
] as const;

export default function AddSubscriptionScreen() {
    const router = useRouter();
    const user = userStorage.getUser();
    const currencySymbol = user?.currency_symbol ?? "₹";

    const mutation = useCreateSubscriptionMutation(user?.clerk_id);
    const [companyModalVisible, setCompanyModalVisible] = useState(false);
    const [manualName, setManualName] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormInput, unknown, FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            amount: "",
            billingInterval: "1",
            billingUnit: "MONTH",
            nextBillingDate: "",
        },
        mode: "onChange",
    });

    const billingUnit = useWatch({ control, name: "billingUnit" });
    const maxBillingInterval = BILLING_INTERVAL_LIMITS[billingUnit];
    const nextBillingDate = useWatch({ control, name: "nextBillingDate" });
    const subscriptionName = useWatch({ control, name: "name" });

    const submit = (data: FormData) => {
        mutation.mutate(data, {
            onSuccess: () => router.back(),
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="flex-row items-center px-5 pb-5 pt-5">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="mr-5">
                        <Feather name="arrow-left" size={24} color="#171B25" />
                    </Pressable>

                    <Text className="text-lg font-bold text-[#171B25]">
                        Add Subscription
                    </Text>
                </View>

                {/* Banner */}
                <View className="mx-4 mb-5 overflow-hidden rounded-[22px]">
                    <PaymentBanner width="100%" height={108} />
                </View>

                {/* Company */}
                <View className="mx-5">
                    <Text className="mb-2 text-[13px] font-bold text-[#252936]">
                        Subscription Name
                    </Text>

                    {!manualName ? (
                        <Pressable
                            onPress={() => setCompanyModalVisible(true)}
                            className="h-12 flex-row items-center rounded-2xl border border-[#E4E5E8] bg-[#F5F6F7] px-4"
                        >
                            <Feather name="search" size={18} color="#596070" />
                            <Text numberOfLines={1} className={`ml-3 flex-1 text-sm ${subscriptionName ? "text-[#171B25]" : "text-[#747986]"}`}>
                                {subscriptionName || "Choose a company"}
                            </Text>
                            <Feather name="chevron-right" size={20} color="#303440" />
                        </Pressable>
                    ) : (
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { value, onChange, onBlur } }) => (
                                <View className="h-12 flex-row items-center rounded-2xl border border-[#E4E5E8] bg-[#F5F6F7] px-4">
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholder="Enter subscription name"
                                        placeholderTextColor="#858A95"
                                        className="flex-1 text-sm text-[#171B25]"
                                    />
                                    <Pressable
                                        onPress={() => {
                                            setManualName(false);
                                            setValue("name", "");
                                        }}
                                    >
                                        <Feather name="x" size={18} color="#777D88" />
                                    </Pressable>
                                </View>
                            )}
                        />
                    )}

                    {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>}
                </View>

                {/* Amount */}
                <View className="mx-5 mt-5">
                    <Text className="mb-2 text-[13px] font-bold text-[#252936]">Amount</Text>

                    <View className="h-12 flex-row overflow-hidden rounded-2xl border border-[#E4E5E8] bg-[#F5F6F7]">
                        <View className="w-11 items-center justify-center border-r border-[#E4E5E8] bg-[#EDF0EF]">
                            <Text className="text-lg font-semibold text-[#374151]">{currencySymbol}</Text>
                        </View>

                        <Controller
                            control={control}
                            name="amount"
                            render={({ field: { value, onChange, onBlur } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="decimal-pad"
                                    placeholder="0.00"
                                    placeholderTextColor="#858A95"
                                    className="flex-1 px-4 text-sm text-[#171B25]"
                                />
                            )}
                        />
                    </View>

                    {errors.amount && <Text className="mt-1 text-xs text-red-500">{errors.amount.message}</Text>}
                </View>

                {/* Billing interval & unit */}
                <View className="mx-5 mt-5 flex-row gap-4">
                    <View className="flex-1">
                        <Text className="mb-2 text-[13px] font-bold text-[#252936]">Billing Interval</Text>

                        <Controller
                            control={control}
                            name="billingInterval"
                            render={({ field: { value, onChange, onBlur } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={input => {
                                        const digits = input.replace(/\D/g, "").replace(/^0+(?=\d)/, "");

                                        if (!digits) return onChange("");

                                        if (Number(digits) <= maxBillingInterval) {
                                            onChange(digits);
                                        }
                                    }}
                                    onBlur={onBlur}
                                    keyboardType="number-pad"
                                    placeholder="1"
                                    maxLength={2}
                                    className="h-12 rounded-2xl border border-[#E4E5E8] bg-[#F5F6F7] px-4 text-sm text-[#171B25]"
                                />
                            )}
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="mb-2 text-[13px] font-bold text-[#252936]">Billing Unit</Text>

                        <Pressable
                            onPress={() => {
                                const index = units.findIndex(unit => unit.value === billingUnit);
                                setValue("billingUnit", units[(index + 1) % units.length].value);
                            }}
                            className="h-12 flex-row items-center justify-between rounded-2xl border border-[#E4E5E8] bg-[#F5F6F7] px-4"
                        >
                            <Text className="text-sm text-[#171B25]">
                                {units.find(unit => unit.value === billingUnit)?.label}
                            </Text>
                            <Feather name="chevron-down" size={19} color="#303440" />
                        </Pressable>
                    </View>
                </View>

                {/* Next billing date */}
                <View className="mx-5 mt-5">
                    <Text className="mb-2 text-[13px] font-bold text-[#252936]">Next Billing Date</Text>

                    <Pressable
                        onPress={() => setDatePickerVisible(true)}
                        className="h-12 flex-row items-center rounded-2xl border border-[#E4E5E8] bg-[#F5F6F7] px-4"
                    >
                        <Feather name="calendar" size={18} color="#596070" />
                        <Text className={`ml-3 flex-1 text-sm ${nextBillingDate ? "text-[#171B25]" : "text-[#747986]"}`}>
                            {nextBillingDate ? format(parseISO(nextBillingDate), "dd MMM yyyy") : "Select date"}
                        </Text>
                        <Feather name="chevron-right" size={20} color="#303440" />
                    </Pressable>

                    {errors.nextBillingDate && <Text className="mt-1 text-xs text-red-500">{errors.nextBillingDate.message}</Text>}

                    {datePickerVisible && (
                        <DateTimePicker
                            value={nextBillingDate ? parseISO(nextBillingDate) : new Date()}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(_, date) => {
                                setDatePickerVisible(false);
                                if (date) setValue("nextBillingDate", format(date, "yyyy-MM-dd"), { shouldValidate: true });
                            }}
                        />
                    )}
                </View>

                {/* Submit */}
                <Pressable
                    onPress={handleSubmit(submit)}
                    disabled={mutation.isPending}
                    className="mx-5 mt-7 h-12 flex-row items-center justify-center rounded-full bg-[#006341]"
                >
                    {mutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-sm font-bold text-white">Add Subscription</Text>
                    )}
                </Pressable>
            </ScrollView>

            <CompanyPickerModal
                visible={companyModalVisible}
                onClose={() => setCompanyModalVisible(false)}
                onSelect={name => {
                    setManualName(false);
                    setValue("name", name, { shouldValidate: true, shouldDirty: true });
                }}
                onManual={() => {
                    setManualName(true);
                    setValue("name", "", { shouldValidate: true });
                }}
            />
        </SafeAreaView>
    );
}