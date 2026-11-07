import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import EmptyBudget from "../../assets/emptyBudget.svg";

const benefits = [
    {
        icon: "target",
        title: "Stay on track",
        description: "Set a spending limit and avoid overspending.",
    },
    {
        icon: "bar-chart-2",
        title: "See your progress",
        description: "Track spending and know how much you save.",
    },
    {
        icon: "star",
        title: "Build better habits",
        description: "Be more mindful about where your money goes.",
    },
] as const;

export default function BudgetEmptyState() {
    const router = useRouter();

    return (
        <View className="flex-1 px-5">
            <View className="mt-7 items-center">
                <EmptyBudget width={240} height={193} />

                <Text className="mt-1 text-center text-[21px] font-bold text-[#111B3A]">
                    No budgets yet
                </Text>

                <Text className="mt-2 max-w-[310px] text-center text-[13px] leading-[19px] text-[#687080]">
                    Set a monthly spending limit to track your expenses, stay in
                    control, and save more.
                </Text>
            </View>

            <View className="mt-6 gap-9 mb-3">
                {benefits.map((benefit) => (
                    <View key={benefit.title} className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-xl">
                            <Feather name={benefit.icon} size={19} color="#C2185B" />
                        </View>

                        <View className="flex-1">
                            <Text className="text-[13px] font-bold text-[#111B3A]">
                                {benefit.title}
                            </Text>
                            <Text className="mt-0.5 text-[11px] text-[#687080]">
                                {benefit.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <Pressable
                onPress={() => router.push("/(root)/(tabs)/budgets/set-budget")}
                className="mt-8 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#006341]"
            >
                <Feather name="plus" size={20} color="white" />
                <Text className="text-sm font-semibold text-white">
                    Set a Budget
                </Text>
            </Pressable>
        </View>
    );
}