import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { Pressable, Text, View } from "react-native";

import type { Subscription } from "../../apis/subscriptionApi";
import { subscriptionCompanies } from "../../constants/subscriptionCompanies";

type Props = {
    subscription: Subscription;
    currencySymbol: string;
    onPress: () => void;
};

const getBillingLabel = (interval: number, unit: Subscription["billing_unit"]) => {
    if (interval === 1) {
        return {
            DAY: "Daily",
            WEEK: "Weekly",
            MONTH: "Monthly",
            YEAR: "Yearly",
        }[unit];
    }

    if (unit === "MONTH" && interval === 3) return "Quarterly";
    if (unit === "MONTH" && interval === 6) return "Every 6 months";

    return `Every ${interval} ${unit.toLowerCase()}s`;
};

export default function SubscriptionItem({ subscription, currencySymbol, onPress }: Props) {
    const brand = subscriptionCompanies.find(
        company => company.name.toLowerCase() === subscription.name.toLowerCase()
    );

    const BrandIcon = brand && "Icon" in brand ? brand.Icon : null;
    const BrandImage = brand && "image" in brand ? brand.image : null;

    const isActive = subscription.status === "ACTIVE";

    const amount = Number(subscription.amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });

    const billingLabel = getBillingLabel(
        subscription.billing_interval,
        subscription.billing_unit
    );

    const nextBillingDate = format(
        parseISO(subscription.next_billing_date),
        "MMM d"
    );

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`View ${subscription.name} details`}
            className="flex-row items-center rounded-2xl border border-[#E9EAEB] bg-white px-3.5 py-3"
        >
            {/* Company logo */}
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl">
                {BrandIcon ? (
                    <BrandIcon size={30} color="default" />
                ) : BrandImage ? (
                    <BrandImage width={30} height={30} />
                ) : (
                    <Feather name="repeat" size={23} color="#006341" />
                )}
            </View>

            {/* Details */}
            <View className="min-w-0 flex-1">
                <Text className="text-[14px] font-bold text-[#171B25]" numberOfLines={1}>
                    {subscription.name}
                </Text>

                <Text className="mt-0.5 text-xs font-medium text-[#454956]">
                    {currencySymbol}{amount} · {billingLabel}
                </Text>

                <View className="mt-1.5 flex-row items-center">
                    <Feather name="calendar" size={12} color="#858A95" />

                    <Text className="ml-1 text-[11px] text-[#737783]">
                        Next on {nextBillingDate}
                    </Text>
                </View>
            </View>

            {/* Status */}
            <View
                className={`ml-2 rounded-full px-3 py-1.5 ${
                    isActive ? "bg-[#D8F3E3]" : "bg-[#FFF0CE]"
                }`}
            >
                <Text
                    className={`text-[11px] font-semibold ${
                        isActive ? "text-[#17633E]" : "text-[#96651D]"
                    }`}
                >
                    {isActive ? "Active" : "Paused"}
                </Text>
            </View>

            <Feather name="chevron-right" size={20} color="#454956" />
        </Pressable>
    );
}