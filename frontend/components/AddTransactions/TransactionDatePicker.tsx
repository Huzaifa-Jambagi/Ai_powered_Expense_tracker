import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

type Props = {
    value: Date;
    onChange: (date: Date) => void;
};

export default function TransactionDatePicker({ value, onChange }: Props) {
    const [isVisible, setIsVisible] = useState(false);

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
                    onValueChange={(_, date) => {
                        onChange(date);
                        setIsVisible(false);
                    }}
                    onDismiss={() => setIsVisible(false)}
                />
            )}
        </View>
    );
}