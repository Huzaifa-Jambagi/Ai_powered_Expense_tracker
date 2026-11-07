import {
    View,
    Text,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import EmptyBudget from "../../../../assets/emptyBudget.svg";
import { userStorage } from "../../../../lib/store";
import { EXPENSE_CATEGORIES } from "../../../../constants/catogories";

import SetBudgetForm from "../../../../components/Budget/SetBudgetForm";
import type { BudgetFormValues } from "../../../../components/Budget/Budget.schema";
import {
    useBudgetSavePending,
    useSetBudgetMutation,
} from "../../../../hooks/useBudgetMutation";

export default function SetBudget() {
    const router = useRouter();

    const { category, amount } = useLocalSearchParams<{
        category?: string;
        amount?: string;
    }>();

    const { mutate } = useSetBudgetMutation();
    const isBudgetSaving = useBudgetSavePending();

    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";

    const isValidCategory = EXPENSE_CATEGORIES.some(
        (item) => item.key === category
    );

    const isValidAmount =
        typeof amount === "string" &&
        Number.isFinite(Number(amount)) &&
        Number(amount) > 0;

    const isEditing = Boolean(isValidCategory && isValidAmount);

    const handleSubmit = (values: BudgetFormValues) => {
        if (isEditing) {
            mutate(values);
            router.back();
            return;
        }

        mutate(values, {
            onSuccess: () => router.back(),
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View className="h-14 flex-row items-center px-5">
                    <Pressable
                        onPress={() => router.back()}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Feather name="arrow-left" size={25} color="#111B3A" />
                    </Pressable>

                    <Text className="ml-7 text-[21px] font-bold text-[#111B3A]">
                        Set Budget
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 20,
                        paddingBottom: 20,
                    }}
                >
                    <View className="items-center pt-5">
                        <EmptyBudget width={145} height={115} />

                        <Text className="mt-2 text-[25px] font-bold text-[#111B3A]">
                            {isEditing ? "Update Budget" : "Set a Budget"}
                        </Text>

                        <Text className="mt-1 max-w-[310px] text-center text-base leading-6 text-[#687080]">
                            Choose a category and set a monthly spending limit.
                        </Text>
                    </View>

                    <View className="mt-10 flex-1">
                        <SetBudgetForm
                            currencySymbol={currencySymbol}
                            isPending={isBudgetSaving}
                            initialCategory={isEditing ? category! : ""}
                            initialAmount={isEditing ? amount! : ""}
                            onSubmit={handleSubmit}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}