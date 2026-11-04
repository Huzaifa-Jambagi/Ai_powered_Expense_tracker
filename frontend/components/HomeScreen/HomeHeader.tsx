import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { userStorage } from "../../lib/store";
import Logo from "../../assets/Logo.svg";

type HomeHeaderProps = {
    totalBalance?: number;
    currencySymbol?: string;
};

export default function HomeHeader({
    totalBalance = 0,
    currencySymbol = "",
}: HomeHeaderProps) {
    const router = useRouter();
    const user = userStorage.getUser();

    const greeting = user?.firstName
        ? `Hello, ${user.firstName}`
        : "Hello";

    const balance = Number(totalBalance) || 0;

    return (
        <View className="mx-5 mt-6">
            <View className="flex-row items-center justify-between">
                <View style={{ position: "relative", top: -8 }}>
                    <Logo width={60} height={60} />
                </View>

                <View className="flex-row items-center gap-3">
                    <View className="items-end">
                        <Text className="text-[13px] text-gray-500">
                            Total Balance
                        </Text>
                        <Text className="mt-0.5 text-lg font-bold text-[#1A1D26]">
                            {balance < 0 ? "-" : ""}
                            {currencySymbol}
                            {Math.abs(balance).toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                            })}
                        </Text>
                    </View>

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
                {greeting},
            </Text>
        </View>
    );
}