import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { format, subMonths } from "date-fns";

type TransactionsMonthPickerProps = {
    selectedMonth: string;
    onSelectMonth: (month: string) => void;
    onConfirm: () => void;
};

export default function TransactionsMonthPicker({
    selectedMonth,
    onSelectMonth,
    onConfirm,
}: TransactionsMonthPickerProps) {
    const months = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => {
                const date = subMonths(new Date(), index);

                return {
                    value: format(date, "yyyy-MM"),
                    label: format(date, "MMMM yyyy"),
                };
            }),
        []
    );

    return (
        <>
            <ScrollView
                className="mt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                }}
            >
                {months.map((month) => {
                    const isSelected = selectedMonth === month.value;

                    return (
                        <Pressable
                            key={month.value}
                            onPress={() => onSelectMonth(month.value)}
                            className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3.5 ${
                                isSelected
                                    ? "border-green-200 bg-green-50"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <Feather
                                name={isSelected ? "check-circle" : "circle"}
                                size={23}
                                color={isSelected ? "#006B38" : "#C4C8CC"}
                            />

                            <Text className="ml-4 text-base font-medium text-slate-950">
                                {month.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View className="border-t border-gray-100 px-5 py-4">
                <Pressable
                    onPress={onConfirm}
                    className="h-12 items-center justify-center rounded-xl bg-green-700 active:bg-green-750"
                >
                    <Text className="text-base font-bold text-white">
                        Select Month
                    </Text>
                </Pressable>
            </View>
        </>
    );
}