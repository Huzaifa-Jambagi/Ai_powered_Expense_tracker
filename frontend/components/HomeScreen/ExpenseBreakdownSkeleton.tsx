
import { View, Text } from "react-native";

export default function ExpenseBreakdownSkeleton() {
    return (
        <View className="mx-4 mt-4 rounded-[20px] border border-gray-200/70 bg-white p-4">
            <Text className="mb-4 ml-2 mt-1 text-[15px] font-semibold text-gray-900">
                Expense Breakdown(This Month)
            </Text>

            <View className="flex-row items-center">
                {/* Donut chart placeholder */}
                <View className="h-[130px] w-[130px] items-center justify-center rounded-full border-[18px] border-gray-200">
                    <View className="h-[65px] w-[65px] rounded-full bg-gray-100" />
                </View>

                {/* Legend placeholders */}
                <View className="ml-12 flex-1 gap-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <View
                            key={index}
                            className="flex-row items-center justify-between"
                        >
                            <View className="mr-2 flex-1 flex-row items-center gap-2">
                                <View className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                                <View className="h-3 flex-1 rounded-md bg-gray-200" />
                            </View>

                            <View className="h-3 w-9 rounded-md bg-gray-200" />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
