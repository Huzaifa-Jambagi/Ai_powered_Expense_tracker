import { Image, Text, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import ProfileBackground from "../../assets/images/total_balance_bg.svg";
import { userStorage } from "../../lib/store";

export function ProfileHeader() {
    const user = userStorage.getUser();

    return (
        <View className="mx-5 mt-6 gap-5">
            <Text className="text-2xl font-bold text-gray-900">
                Profile
            </Text>

            <View className="relative min-h-[150px] flex-row items-center gap-5 overflow-hidden rounded-3xl bg-[#005A35] px-5 py-6">
                {/* SVG Background */}
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                    <ProfileBackground
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid slice"
                    />
                </View>

                {/* Profile Content */}
                <View className="z-10 h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-200">
                    {user?.image_url ? (
                        <Image
                            source={{ uri: user.image_url }}
                            className="h-full w-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Feather name="user" size={40} color="#9CA3AF" />
                    )}
                </View>

                <View className="z-10 flex-1 gap-2">
                    <Text className="text-2xl font-bold text-white" numberOfLines={1}>
                        {user?.firstName || "User"}
                    </Text>

                    {user?.email && (
                        <View className="flex-row items-center gap-2">
                            <Feather name="mail" size={17} color="white" />
                            <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                                {user.email}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}