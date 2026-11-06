import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetEmptyState from "../../../../components/Budget/BudgetEmptyState";

export default function Budget() {
    // Replace with your actual budget query later.
    const budgets = [];

    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <View className="px-5 pt-3">
                <Text className="text-[22px] font-bold text-[#111B3A]">
                    Budgets
                </Text>
            </View>

            {budgets.length === 0 ? (
                <BudgetEmptyState />
            ) : (
                <View className="flex-1">
                    {/* Budget overview component goes here */}
                </View>
            )}
        </SafeAreaView>
    );
}