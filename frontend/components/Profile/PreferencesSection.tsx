import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type PreferencesSectionProps = {
    currency: string;
    onCurrencyPress: () => void;
};

export function PreferencesSection({ currency, onCurrencyPress }: PreferencesSectionProps) {
    return (
        <View className="mx-5 mt-7 gap-4">
            <Text className="text-xl font-bold text-gray-900">Preferences</Text>

            <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <Pressable
                    onPress={onCurrencyPress}
                    className="flex-row items-center gap-3 px-4 py-4 active:bg-gray-50"
                >
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <Text className="text-2xl">🌍</Text>
                    </View>

                    <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold text-gray-900">Currency</Text>
                        <Text className="text-xs text-gray-400">Default display currency</Text>
                    </View>

                    <Text className="text-sm font-semibold text-gray-700">{currency}</Text>
                    <Feather name="chevron-right" size={19} color="#9CA3AF" />
                </Pressable>
            </View>
        </View>
    );
}