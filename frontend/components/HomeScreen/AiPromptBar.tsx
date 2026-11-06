import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

<MaterialCommunityIcons
    name="auto-fix"
    size={28}
    color="#16865D"
/>

export default function AIPromptBar() {
    const router = useRouter();

    return (
        <Pressable
            onPress={() => router.push("/assistant")}
            className="mx-5 mt-[18px] flex-row items-center gap-2.5 rounded-[18px] border border-[#E8E6DF] bg-white p-3.5"
        >
            <View className="h-[26px] w-[26px] items-center justify-center rounded-full">
                <MaterialCommunityIcons
                    name="auto-fix"
                    size={18}
                    color="#16865D"
                />
            </View>

            <Text className="flex-1 text-[13px] text-gray-500">
                Ask AI anything about your money
            </Text>

            <Feather name="arrow-right" size={16} color="#15803D" />
        </Pressable>
    );
}