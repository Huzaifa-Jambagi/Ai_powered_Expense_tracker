import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type ProUpgradeCardProps = {
    onPress: () => void;
};

export function ProUpgradeCard({ onPress }: ProUpgradeCardProps) {
    return (
        <Pressable onPress={onPress} className="mx-5 mt-5 flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                <Feather name="award" size={25} color="#E6005A" />
            </View>

            <View className="flex-1 gap-1">
                <Text className="text-base font-bold text-gray-900">
                    Upgrade to Pro
                </Text>

                <Text className="text-sm text-gray-500">
                    Unlock all premium features.
                </Text>
            </View>

            <Feather name="chevron-right" size={22} color="#9CA3AF" />
        </Pressable>
    );
}
