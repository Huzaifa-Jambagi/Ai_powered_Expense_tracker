import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
    onBack: () => void;
};

function SubscriptionDetailsHeader({ onBack }: Props) {
    return (
        <View className="h-12 flex-row items-center justify-between px-5">
            <Pressable onPress={onBack} hitSlop={10} accessibilityLabel="Go back">
                <Feather name="arrow-left" size={24} color="#171B25" />
            </Pressable>

            <Text className="text-base font-bold text-[#171B25]">
                Subscription Details
            </Text>

            <View className="w-6" />
        </View>
    );
}

export default memo(SubscriptionDetailsHeader);