import { Text, View } from "react-native";
import BalanceBackground from "../../assets/images/total_balance_bg.svg";

type Props = {
    amount: number;
    activeCount: number;
    currencySymbol: string;
};

export default function SubscriptionSummaryCard({ amount, activeCount, currencySymbol }: Props) {
    const formattedAmount = `${currencySymbol}${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

    return (
        <View className="relative mx-4 -mt-4 h-[265px] overflow-hidden rounded-[30px]">
            <View className="absolute inset-0">
                <BalanceBackground width="100%" height="100%" />
            </View>

            <View className="z-10 flex-1 items-start justify-center p-5">
                <Text className="text-base font-medium text-white/80">
                    Subscription Payments This Month
                </Text>

                <Text
                    className="mt-2 text-4xl font-bold text-white"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {formattedAmount}
                </Text>

                <View className="mt-7 w-full">
                    <View className="h-px bg-white/20" />

                    <View className="mt-4 flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm font-medium text-white/75">
                                Active Subscriptions
                            </Text>

                            <Text className="mt-1 text-2xl font-bold text-white">
                                {activeCount}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}