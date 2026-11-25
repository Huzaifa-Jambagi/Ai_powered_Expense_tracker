import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { memo } from "react";
import { Text, View } from "react-native";

import type { Subscription } from "../../apis/subscriptionApi";

type Props = {
    subscription: Subscription;
    currencySymbol: string;
};

type InfoRowProps = {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    isLast?: boolean;
};

function InfoRow({ icon, label, value, isLast = false }: InfoRowProps) {
    return (
        <View className={`h-[53px] flex-row items-center ${
            !isLast ? "border-b border-[#F0F0F0]" : ""
        }`}>
            <Feather name={icon} size={17} color="#777D88" />

            <Text className="ml-3 flex-1 text-xs font-medium text-[#454956]">
                {label}
            </Text>

            <Text className="text-xs font-semibold text-[#171B25]">
                {value}
            </Text>
        </View>
    );
}

function SubscriptionInfoCard({ subscription, currencySymbol }: Props) {
    const billingLabels: Record<Subscription["billing_unit"], string> = {
        DAY: "day",
        WEEK: "week",
        MONTH: "month",
        YEAR: "year",
    };

    const billingInterval = subscription.billing_interval;
    const billingUnit = subscription.billing_unit;

    const billingLabel = billingInterval === 1
        ? `Every ${billingLabels[billingUnit]}`
        : billingUnit === "MONTH" && billingInterval === 3
            ? "Quarterly"
            : billingUnit === "MONTH" && billingInterval === 6
                ? "Every 6 months"
                : `Every ${billingInterval} ${billingLabels[billingUnit]}s`;

    const nextBillingDate = format(
        parseISO(subscription.next_billing_date),
        "dd MMM yyyy"
    );

    const amount = `${currencySymbol}${Number(subscription.amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

    return (
        <View className="mx-5 rounded-2xl border border-[#E9EAEB] bg-white px-4">
            <InfoRow
                icon="calendar"
                label="Next billing date"
                value={nextBillingDate}
            />

            <InfoRow
                icon="refresh-cw"
                label="Billing interval"
                value={billingLabel}
            />

            <InfoRow
                icon="tag"
                label="Amount"
                value={amount}
            />

            <InfoRow
                icon="activity"
                label="Status"
                value={subscription.status === "ACTIVE" ? "Active" : "Paused"}
                isLast
            />
        </View>
    );
}

export default memo(SubscriptionInfoCard);