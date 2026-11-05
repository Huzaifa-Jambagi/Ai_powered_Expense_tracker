import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { userStorage } from "../../lib/store";
import Logo from "../../assets/Logo.svg";

type HomeHeaderProps = {
    isBalanceVisible: boolean;
    onToggleVisibility: () => void;
};

export default function HomeHeader({
    isBalanceVisible,
    onToggleVisibility,
}: HomeHeaderProps) {
    const router = useRouter();
    const user = userStorage.getUser();

    const greeting = user?.firstName
        ? `Hello, ${user.firstName}`
        : "Hello";

    return (
        <View className="mx-5 mt-6">
            <View className="flex-row items-center justify-between">
                <View style={{ position: "relative", top: -8 }}>
                    <Logo width={60} height={60} />
                </View>

                <View className="flex-row items-center gap-3">
                    <Pressable
                        onPress={onToggleVisibility}
                        hitSlop={10}
                        className="h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200"
                    >
                        <Feather
                            name={isBalanceVisible ? "eye" : "eye-off"}
                            size={20}
                            color="#1A1D26"
                        />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/profile")}
                        className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-green-100"
                    >
                        {user?.image_url ? (
                            <Image
                                source={{ uri: user.image_url }}
                                className="h-14 w-14"
                                resizeMode="cover"
                            />
                        ) : (
                            <Feather name="user" size={25} color="#15803d" />
                        )}
                    </Pressable>
                </View>
            </View>

            <Text className="-mb-4 mt-1 text-xl font-bold text-gray-700">
                {greeting}
            </Text>
        </View>
    );
}