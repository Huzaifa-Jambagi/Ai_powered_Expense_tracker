import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    View,
    Text,
    TextInput,
    Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { EXPENSE_CATEGORIES } from "../../constants/catogories";
import CategoryModal from "./CategoryModal";
import {
    budgetSchema,
    type BudgetFormInput,
    type BudgetFormValues,
} from "./Budget.schema";

type SetBudgetFormProps = {
    currencySymbol: string;
    isPending: boolean;
    initialCategory?: string;
    initialAmount?: string;
    onSubmit: (values: BudgetFormValues) => void;
};

export default function SetBudgetForm({
    currencySymbol,
    isPending,
    initialCategory = "",
    initialAmount = "",
    onSubmit,
}: SetBudgetFormProps) {
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BudgetFormInput, any, BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        mode: "onBlur",
        defaultValues: {
            category: initialCategory as BudgetFormInput["category"],
            amount: initialAmount,
        },
    });

    useEffect(() => {
        reset({
            category: initialCategory as BudgetFormInput["category"],
            amount: initialAmount,
        });
    }, [initialCategory, initialAmount, reset]);

    return (
        <View className="gap-5">
            {/* Category */}
            <View>
                <Text className="mb-2 text-sm font-semibold text-[#111B3A]">
                    Category
                </Text>

                <Controller
                    control={control}
                    name="category"
                    render={({ field: { value, onChange } }) => {
                        const selected = EXPENSE_CATEGORIES.find(
                            (category) => category.key === value
                        );

                        return (
                            <>
                                <Pressable
                                    onPress={() => setCategoryModalOpen(true)}
                                    accessibilityRole="button"
                                    className="h-[62px] flex-row items-center justify-between rounded-xl border border-[#E8E6DF] bg-white px-4"
                                >
                                    <View className="flex-row items-center gap-3">
                                        {selected ? (
                                            <View
                                                className="h-10 w-10 items-center justify-center rounded-full"
                                                style={{
                                                    backgroundColor: `${selected.color}20`,
                                                }}
                                            >
                                                <Text className="text-xl">
                                                    {selected.icon}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                <Feather
                                                    name="grid"
                                                    size={18}
                                                    color="#8A8D96"
                                                />
                                            </View>
                                        )}

                                        <Text
                                            className={`text-sm font-medium ${
                                                selected
                                                    ? "text-[#111B3A]"
                                                    : "text-[#8A8D96]"
                                            }`}
                                        >
                                            {selected?.label ?? "Select category"}
                                        </Text>
                                    </View>

                                    <Feather
                                        name="chevron-down"
                                        size={19}
                                        color="#8A8D96"
                                    />
                                </Pressable>

                                <CategoryModal
                                    visible={categoryModalOpen}
                                    selectedCategory={selected?.key ?? null}
                                    onSelect={onChange}
                                    onClose={() => setCategoryModalOpen(false)}
                                />
                            </>
                        );
                    }}
                />

                {errors.category && (
                    <Text className="mt-1.5 text-xs text-brand-coral">
                        {errors.category.message}
                    </Text>
                )}
            </View>

            {/* Budget Amount */}
            <View>
                <Text className="mb-2 text-sm font-semibold text-[#111B3A]">
                    Monthly Budget
                </Text>

                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { value, onChange, onBlur } }) => (
                        <View className="h-[62px] flex-row items-center rounded-xl border border-[#E8E6DF] bg-white px-4">
                            <Text className="mr-2 text-lg font-semibold text-[#111B3A]">
                                {currencySymbol}
                            </Text>

                            <TextInput
                                className="flex-1 text-base font-medium text-[#111B3A]"
                                placeholder="Enter budget amount"
                                placeholderTextColor="#8A8D96"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="decimal-pad"
                                selectionColor="#006341"
                                underlineColorAndroid="transparent"
                            />
                        </View>
                    )}
                />

                {errors.amount && (
                    <Text className="mt-1.5 text-xs text-brand-coral">
                        {errors.amount.message}
                    </Text>
                )}
            </View>

            {/* Submit */}
            <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
                accessibilityRole="button"
                className={`h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#006341] ${
                    isPending ? "opacity-60" : ""
                }`}
            >
                <Feather name="check" size={18} color="white" />
                <Text className="text-sm font-semibold text-white">
                    Save Budget
                </Text>
            </Pressable>
        </View>
    );
}