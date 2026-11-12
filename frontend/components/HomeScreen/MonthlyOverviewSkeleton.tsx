import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function MonthlyOverviewSkeleton() {
    return (
        <View className="mx-4 -mt-6 mb-7 flex-row gap-3">
            <View className="flex-1 rounded-[20px] border border-gray-200/70 bg-white p-4">
                <View className="mb-3 flex-row items-center gap-2">
                    <Feather name="trending-up" size={16} color="#16A34A" />
                    <Text className="text-xs font-medium text-gray-500">
                        MONTHLY INCOME
                    </Text>
                </View>

                <View className="h-6 w-28 rounded-md bg-gray-200" />
                <Text className="mt-1 text-xs text-gray-400">This month</Text>
            </View>

            <View className="flex-1 rounded-[20px] border border-gray-200/70 bg-white p-4">
                <View className="mb-3 flex-row items-center gap-2">
                    <Feather name="trending-down" size={16} color="#EF4444" />
                    <Text className="text-xs font-medium text-gray-500">
                        MONTHLY EXPENSE
                    </Text>
                </View>

                <View className="h-6 w-28 rounded-md bg-gray-200" />
                <Text className="mt-1 text-xs text-gray-400">This month</Text>
            </View>
        </View>
    );
}
