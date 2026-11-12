
import { Text, View } from "react-native";
import BalanceBackground from "../../assets/images/total_balance_bg.svg";

export default function BalanceCardSkeleton() {
    return (
        <View className="relative mx-4 h-[265px] overflow-hidden rounded-[30px]">
            <View className="absolute inset-0">
                <BalanceBackground width="100%" height="100%" />
            </View>

            <View className="z-10 flex-1 items-start justify-center p-5">
                <Text className="text-base font-medium text-white/80">
                    Total Balance
                </Text>

                <View className="mt-3 h-10 w-56 rounded-lg bg-white/20" />

                <View className="mt-6 w-full">
                    <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-white/80">
                            Monthly Budget
                        </Text>

                        <View className="h-4 w-32 rounded-md bg-white/20" />
                    </View>

                    <View className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                        <View className="h-full w-[55%] rounded-full bg-white/30" />
                    </View>

                    <View className="mt-3 h-3 w-28 rounded-md bg-white/20" />
                </View>
            </View>
        </View>
    );
}
