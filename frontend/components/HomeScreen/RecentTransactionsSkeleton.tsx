import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function RecentTransactionsSkeleton() {
    return (
        <View className="mx-4 mt-5 mb-5">
            <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-gray-900">
                    Recent transactions
                </Text>

                <Pressable
                    onPress={() => router.push("/(root)/(tabs)/transactions")}
                    className="flex-row items-center gap-1"
                >
                    <Text className="text-[12px] font-semibold text-brand-primary">
                        See all
                    </Text>
                    <Text className="text-brand-primary">»</Text>
                </Pressable>
            </View>

            <View className="gap-3">
                {Array.from({ length: 5 }, (_, index) => (
                    <View
                        key={index}
                        className="flex-row items-center rounded-[22px] border border-gray-100 bg-white p-4"
                    >
                        {/* Category icon */}
                        <View className="mr-4 h-[66px] w-[66px] rounded-[22px] bg-gray-200" />

                        {/* Transaction details */}
                        <View className="min-w-0 flex-1">
                            <View className="h-4 w-32 rounded-md bg-gray-200" />

                            <View className="mt-2 flex-row items-center gap-2">
                                <Feather name="edit-2" size={15} color="#D1D5DB" />
                                <View className="h-6 w-20 rounded-full bg-gray-200" />
                            </View>
                        </View>

                        {/* Amount */}
                        <View className="ml-2 h-5 w-20 rounded-md bg-gray-200" />
                    </View>
                ))}
            </View>
        </View>
    );
}
