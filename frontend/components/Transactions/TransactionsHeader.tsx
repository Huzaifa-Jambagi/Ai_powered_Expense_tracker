import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

type TransactionsHeaderProps = {
    onFilterPress: () => void;
    onExportPress?: () => void;
    hasActiveFilters?: boolean;
};

export default function TransactionsHeader({
    onFilterPress,
    onExportPress,
    hasActiveFilters = false,
}: TransactionsHeaderProps) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-slate-950">
                Transactions
            </Text>

            <View className="flex-row items-center gap-3">
                {/* Filter */}
                <Pressable
                    onPress={onFilterPress}
                    className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
                    accessibilityRole="button"
                    accessibilityLabel="Filter transactions"
                    hitSlop={4}
                >
                    <Feather name="filter" size={22} color="#E11D48" />

                    {hasActiveFilters && (
                        <View className="absolute right-3 top-2.5 h-2 w-2 rounded-full bg-rose-600" />
                    )}
                </Pressable>

                {/* CSV Export */}
                <Pressable
                    onPress={onExportPress}
                    disabled={!onExportPress}
                    className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
                    accessibilityRole="button"
                    accessibilityLabel="Export transactions as CSV"
                    hitSlop={4}
                >
                    <Feather name="download" size={22} color="#0F172A" />
                </Pressable>
            </View>
        </View>
    );
}