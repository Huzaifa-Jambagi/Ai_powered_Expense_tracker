import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { userStorage } from "../../../../lib/store";

import { useSubscriptionQuery } from "../../../../hooks/subscriptionQueries";
import { useAccountsQuery } from "../../../../hooks/useAccounts";
import { useDeleteSubscriptionMutation, useMarkSubscriptionAsPaidMutation, useUpdateSubscriptionStatusMutation } from "../../../../hooks/subscriptionMutation";
import SubscriptionDetailsHeader from "../../../../components/Subscriptions/SubscriptionDetailsHeader";
import SubscriptionOverview from "../../../../components/Subscriptions/SubscriptionOverview";
import SubscriptionInfoCard from "../../../../components/Subscriptions/SubscriptionInfoCard";
import SubscriptionDetailsActions from "../../../../components/Subscriptions/SubscriptionDetailsActions";
import AccountPickerModal from "../../../../components/Subscriptions/AccountPickerModal";


export default function SubscriptionDetailsScreen() {
    const router = useRouter();
    const { subscriptionId } = useLocalSearchParams<{ subscriptionId: string }>();

    const user = userStorage.getUser();
    const userId = user?.clerk_id;
    const currencySymbol = user?.currency_symbol ?? "₹";

    const [accountPickerVisible, setAccountPickerVisible] = useState(false);

    const {
        data: subscription,
        isLoading,
        isError,
        refetch,
    } = useSubscriptionQuery(subscriptionId, userId);

    const { data: accounts = [], isLoading: accountsLoading } = useAccountsQuery();

    const {
        mutate: markAsPaid,
        isPending: isPaying,
    } = useMarkSubscriptionAsPaidMutation(userId);

    const {
        mutate: updateStatus,
        isPending: isUpdatingStatus,
    } = useUpdateSubscriptionStatusMutation(userId);

    const {
        mutate: deleteSubscription,
        isPending: isDeleting,
    } = useDeleteSubscriptionMutation(userId);

    const isActive = subscription?.status === "ACTIVE";

    const handlePayment = useCallback((accountId: string) => {
        markAsPaid(
            { subscriptionId, accountId },
            {
                onSuccess: () => {
                    setAccountPickerVisible(false);
                    Alert.alert("Payment recorded", "Your subscription payment was recorded successfully.");
                },
                onError: () => {
                    Alert.alert("Payment failed", "Couldn't record this payment. Please try again.");
                },
            },
        );
    }, [markAsPaid, subscriptionId]);

    const handleStatusChange = useCallback(() => {
        if (!subscription) return;

        updateStatus(
            {
                subscriptionId,
                status: isActive ? "PAUSED" : "ACTIVE",
            },
            {
                onError: () => {
                    Alert.alert("Update failed", "Couldn't update subscription status.");
                },
            },
        );
    }, [updateStatus, subscription, subscriptionId, isActive]);

    const handleDelete = useCallback(() => {
        if (!subscription) return;

        Alert.alert(
            "Delete Subscription",
            `Are you sure you want to delete ${subscription.name}? This will remove it from your tracker.`,
            [
                { text: "Keep Subscription", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteSubscription(subscriptionId, {
                            onSuccess: () => router.replace("/(root)/(tabs)/subscription" as never),
                            onError: () => {
                                Alert.alert("Delete failed", "Couldn't delete this subscription.");
                            },
                        });
                    },
                },
            ],
        );
    }, [subscription, subscriptionId, deleteSubscription, router]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#F8F8F7]">
                <ActivityIndicator size="large" color="#006341" />
            </SafeAreaView>
        );
    }

    if (isError || !subscription) {
        return (
            <SafeAreaView className="flex-1 bg-[#F8F8F7]">
                <SubscriptionDetailsHeader onBack={() => router.back()} />

                <View className="flex-1 items-center justify-center px-6">
                    <Feather name="alert-circle" size={32} color="#D65B5B" />

                    <Text className="mt-3 text-base font-bold text-[#171B25]">
                        Couldn't load subscription
                    </Text>

                    <Text className="mt-1 text-center text-sm text-[#858A95]">
                        Check your connection and try again.
                    </Text>

                    <Text
                        onPress={() => refetch()}
                        className="mt-4 font-semibold text-[#006341]"
                    >
                        Try again
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <SubscriptionDetailsHeader onBack={() => router.back()} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 36 }}
                showsVerticalScrollIndicator={false}
            >
                <SubscriptionOverview
                    subscription={subscription}
                    currencySymbol={currencySymbol}
                />

                <SubscriptionInfoCard
                    subscription={subscription}
                    currencySymbol={currencySymbol}
                />

                <SubscriptionDetailsActions
                    isActive={isActive}
                    isPaying={isPaying}
                    isUpdatingStatus={isUpdatingStatus}
                    isDeleting={isDeleting}
                    onMarkAsPaid={() => setAccountPickerVisible(true)}
                    onToggleStatus={handleStatusChange}
                    onDelete={handleDelete}
                />
            </ScrollView>

            <AccountPickerModal
                visible={accountPickerVisible}
                accounts={accounts}
                currencySymbol={currencySymbol}
                isLoading={accountsLoading}
                isPending={isPaying}
                onClose={() => setAccountPickerVisible(false)}
                onSelect={handlePayment}
            />
        </SafeAreaView>
    );
}