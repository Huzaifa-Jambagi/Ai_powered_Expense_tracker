import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Account } from "../../apis/accountApis";

const accountConfig: Record<Account["type"], { icon: string; label: string }> = {
    CASH: { icon: "💵", label: "Cash" },
    BANK: { icon: "🏦", label: "Bank Account" },
    CREDIT_CARD: { icon: "💳", label: "Credit Card" },
    OTHER: { icon: "💼", label: "Other" },
};

type AccountsSectionProps = {
    accounts: Account[];
    currency: string;
    isLoading: boolean;
    onAddAccount: () => void;
    onAccountPress?: (account: Account) => void;
};

export function AccountsSection({ accounts, currency, isLoading, onAddAccount, onAccountPress }: AccountsSectionProps) {
    return (
        <View className="mx-5 mt-7 gap-4">
            <Text className="text-xl font-bold text-gray-900">My Accounts</Text>

            <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {isLoading ? (
                    <View className="items-center py-8">
                        <ActivityIndicator color="#15803D" />
                    </View>
                ) : (
                    accounts.map((account, index) => (
                        <Pressable
                            key={account.id}
                            onPress={() => onAccountPress?.(account)}
                            disabled={!onAccountPress}
                            accessibilityRole="button"
                            className={`flex-row items-center gap-3 px-4 py-4 active:bg-gray-50 ${index ? "border-t border-gray-100" : ""}`}
                        >
                            <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <Text className="text-2xl">{accountConfig[account.type].icon}</Text>
                            </View>

                            <View className="flex-1 gap-1">
                                <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                                    {account.name}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {accountConfig[account.type].label}
                                </Text>
                            </View>

                            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                {Number(account.balance).toLocaleString(undefined, { style: "currency", currency })}
                            </Text>

                            {onAccountPress && <Feather name="chevron-right" size={19} color="#9CA3AF" />}
                        </Pressable>
                    ))
                )}

                <Pressable
                    onPress={onAddAccount}
                    accessibilityRole="button"
                    className="flex-row items-center gap-3 border-t border-gray-100 px-4 py-4 active:bg-gray-50"
                >
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-green-50">
                        <Feather name="plus" size={22} color="#15803D" />
                    </View>

                    <Text className="flex-1 text-base font-semibold text-gray-900">
                        Add Account
                    </Text>

                    <Feather name="chevron-right" size={19} color="#9CA3AF" />
                </Pressable>
            </View>
        </View>
    );
}