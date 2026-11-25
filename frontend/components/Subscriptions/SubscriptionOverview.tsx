import { memo, useMemo } from "react";
import { Text, View } from "react-native";

import type { Subscription } from "../../apis/subscriptionApi";
import { subscriptionCompanies } from "../../constants/subscriptionCompanies";

type Props = {
    subscription: Subscription;
    currencySymbol: string;
};

function SubscriptionOverview({ subscription, currencySymbol }: Props) {
    const brand = useMemo(
        () => subscriptionCompanies.find(
            company => company.name.toLowerCase() === subscription.name.toLowerCase()
        ),
        [subscription.name]
    );

    const amount = Number(subscription.amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });

    const isActive = subscription.status === "ACTIVE";

    const BrandIcon = brand && "Icon" in brand ? brand.Icon : null;
    const BrandImage = brand && "image" in brand ? brand.image : null;

    return (
        <View className="items-center px-5 pb-6 pt-7">
            <View className="mb-4 h-[76px] w-[76px] items-center justify-center rounded-[20px] bg-white">
                {BrandIcon ? (
                    <BrandIcon size={53} color="default" />
                ) : BrandImage ? (
                    <BrandImage width={57} height={57} />
                ) : (
                    <Text className="text-4xl font-bold text-[#006341]">
                        {subscription.name.charAt(0).toUpperCase()}
                    </Text>
                )}
            </View>

            <Text className="text-[22px] font-bold text-[#171B25]">
                {subscription.name}
            </Text>

            <Text className="mt-1 text-[28px] font-bold text-[#171B25]">
                {currencySymbol}{amount}
            </Text>

            <View className={`mt-3 rounded-full px-4 py-1.5 ${
                isActive ? "bg-[#D9F3E4]" : "bg-[#FFF0CE]"
            }`}>
                <Text className={`text-xs font-semibold ${
                    isActive ? "text-[#17633E]" : "text-[#96651D]"
                }`}>
                    {isActive ? "Active" : "Paused"}
                </Text>
            </View>
        </View>
    );
}

export default memo(SubscriptionOverview);