import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
type Props = {
    value: Date;
    onChange: (date: Date) => void;
};

export default function TransactionDatePicker({ value, onChange }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    const today = new Date();
    const minimumDate = startOfDay(subMonths(today, 11));
    const maximumDate = endOfDay(today);

    const handleDateChange = (_event: unknown, date: Date) => {
        onChange(date);
        setIsVisible(false);
    };

    return (
        <View className="mb-6">
            <Text className="mb-2 text-base font-bold text-slate-950">
                Date
            </Text>

            <Pressable
                onPress={() => setIsVisible(true)}
                className="h-16 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4"
            >
                <Feather name="calendar" size={22} color="#15803D" />

                <Text className="ml-4 flex-1 text-base font-medium text-slate-950">
                    {format(value, "dd MMM yyyy")}
                </Text>

                <Feather name="chevron-down" size={21} color="#64748B" />
            </Pressable>

            {isVisible && (
                <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "calendar"}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onValueChange={handleDateChange}
                    onDismiss={() => setIsVisible(false)}
                />
            )}
        </View>
    );
}