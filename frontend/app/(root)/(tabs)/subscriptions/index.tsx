import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";

import { userStorage } from "../../../../lib/store";
import { useSubscriptionsQuery } from "../../../../hooks/subscriptionQueries";
import SubscriptionSummaryCard from "../../../../components/Subscriptions/SubscriptionSummaryCard";
import SubscriptionItem from "../../../../components/Subscriptions/SubscriptionItem";



const FILTERS = [
    { label: "All", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Paused", value: "PAUSED" },
] as const;

type SubscriptionFilter = typeof FILTERS[number]["value"];

export default function SubscriptionsScreen() {
    const router = useRouter();
    const user = userStorage.getUser();

    const userId = user?.clerk_id;
    const currencySymbol = user?.currency_symbol ?? "₹";
    const currentMonth = format(new Date(), "yyyy-MM");

    const [filter, setFilter] = useState<SubscriptionFilter>("ALL");

    const {
        data: subscriptions = [],
        isLoading,
        isError,
        refetch,
    } = useSubscriptionsQuery(userId);

    const activeCount = useMemo(
        () => subscriptions.filter(subscription => subscription.status === "ACTIVE").length,
        [subscriptions]
    );

    const monthlyCost = useMemo(
        () => subscriptions.reduce((total, subscription) => {
            if (
                subscription.status !== "ACTIVE" ||
                !subscription.next_billing_date.startsWith(currentMonth)
            ) return total;

            return total + Number(subscription.amount);
        }, 0),
        [subscriptions, currentMonth]
    );

   const filteredSubscriptions = useMemo(
    () => subscriptions.filter(subscription =>
        filter === "ALL" || subscription.status === filter
    ),
    [subscriptions, filter]
);
    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <ScrollView
                className="flex-1 mt-3 p-1"
                contentContainerStyle={{ paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-4 pt-3">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-[25px] font-bold text-[#171B25]">
                                Subscriptions
                            </Text>

                            <Text className="mt-0.5 text-sm text-[#737783]">
                                Track your recurring payments
                            </Text>
                        </View>

                        <Pressable
                            className="h-11 w-11 items-center justify-center rounded-full bg-[#006341]"
                            onPress={() => router.push("/(root)/(tabs)/subscriptions/add-subscription" as never)}
                            accessibilityRole="button"
                            accessibilityLabel="Add subscription"
                        >
                            <Feather name="plus" size={24} color="#FFFFFF" />
                        </Pressable>
                    </View>
                </View>

                {/* Monthly summary */}
                <SubscriptionSummaryCard
                    amount={monthlyCost}
                    activeCount={activeCount}
                    currencySymbol={currencySymbol}
                />

                {/* Filters */}
                <View className="mt-4 px-4">
                    <View className="flex-row gap-2">
                        {FILTERS.map(item => {
                            const selected = filter === item.value;

                            return (
                                <Pressable
                                    key={item.value}
                                    onPress={() => setFilter(item.value)}
                                    className={`rounded-full px-5 py-2.5 ${
                                        selected ? "bg-[#006341]" : "bg-[#EBECEF]"
                                    }`}
                                >
                                    <Text className={`text-xs font-semibold ${
                                        selected ? "text-white" : "text-[#454956]"
                                    }`}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Subscription list */}
                <View className="mt-4 gap-2.5 px-4">
                    {isLoading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator size="large" color="#006341" />
                            <Text className="mt-3 text-sm text-[#737783]">
                                Loading subscriptions...
                            </Text>
                        </View>
                    ) : isError ? (
                        <View className="items-center rounded-2xl bg-white py-10">
                            <Feather name="alert-circle" size={28} color="#D65B5B" />
                            <Text className="mt-3 font-semibold text-[#171B25]">
                                Couldn't load subscriptions
                            </Text>
                            <Pressable onPress={() => refetch()} className="mt-3">
                                <Text className="font-semibold text-[#006341]">
                                    Try again
                                </Text>
                            </Pressable>
                        </View>
                    ) : filteredSubscriptions.length === 0 ? (
                        <View className="items-center rounded-2xl bg-white py-12">
                            <Feather name="calendar" size={30} color="#A0A5AF" />
                            <Text className="mt-3 font-semibold text-[#171B25]">
                                {filter === "ALL" ? "No subscriptions yet" : `No ${filter.toLowerCase()} subscriptions`}
                            </Text>
                            <Text className="mt-1 text-center text-sm text-[#858A95]">
                                Your subscriptions will appear here
                            </Text>
                        </View>
                    ) : (
                        filteredSubscriptions.map(subscription => (
                            <SubscriptionItem
                                key={subscription.id}
                                subscription={subscription}
                                currencySymbol={currencySymbol}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}