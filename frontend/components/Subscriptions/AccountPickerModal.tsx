import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from "react-native";

type Account = {
    id: string;
    name: string;
    type: "CASH" | "BANK" | "CREDIT_CARD" | "OTHER";
    balance: string;
};

type Props = {
    visible: boolean;
    accounts: Account[];
    currencySymbol: string;
    isLoading: boolean;
    isPending: boolean;
    onClose: () => void;
    onSelect: (accountId: string) => void;
};

const ACCOUNT_ICONS: Record<Account["type"], keyof typeof Feather.glyphMap> = {
    CASH: "dollar-sign",
    BANK: "briefcase",
    CREDIT_CARD: "credit-card",
    OTHER: "box",
};

export default function AccountPickerModal({
    visible,
    accounts,
    currencySymbol,
    isLoading,
    isPending,
    onClose,
    onSelect,
}: Props) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/35">
                <View className="max-h-[75%] rounded-t-[28px] bg-white px-5 pb-8 pt-3">
                    <View className="mb-5 items-center">
                        <View className="h-1 w-10 rounded-full bg-[#C5C8CE]" />
                    </View>

                    <View className="mb-5 flex-row items-center justify-between">
                        <View>
                            <Text className="text-lg font-bold text-[#171B25]">
                                Select an account
                            </Text>
                            <Text className="mt-1 text-xs text-[#858A95]">
                                Choose where to record this payment
                            </Text>
                        </View>

                        <Pressable onPress={onClose} hitSlop={10} disabled={isPending}>
                            <Feather name="x" size={23} color="#171B25" />
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator color="#006341" size="large" />
                        </View>
                    ) : accounts.length === 0 ? (
                        <View className="items-center py-10">
                            <Feather name="credit-card" size={30} color="#A0A5AF" />
                            <Text className="mt-3 font-semibold text-[#171B25]">
                                No accounts available
                            </Text>
                            <Text className="mt-1 text-xs text-[#858A95]">
                                Add an account before recording a payment.
                            </Text>
                        </View>
                    ) : (
                        <FlatList<Account>
                            data={accounts}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <Pressable
                                    disabled={isPending}
                                    onPress={() => onSelect(item.id)}
                                    className="mb-2 flex-row items-center rounded-2xl border border-[#E9EAEB] bg-white px-4 py-3"
                                >
                                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#E8F3EE]">
                                        <Feather name={ACCOUNT_ICONS[item.type]} size={20} color="#006341" />
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-[#171B25]">
                                            {item.name}
                                        </Text>
                                        <Text className="mt-0.5 text-xs text-[#858A95]">
                                            {item.type.replace("_", " ")}
                                        </Text>
                                    </View>

                                    <View className="items-end">
                                        <Text className="text-sm font-bold text-[#171B25]">
                                            {currencySymbol}{Number(item.balance).toLocaleString("en-IN", {
                                                maximumFractionDigits: 2,
                                            })}
                                        </Text>
                                        {isPending ? (
                                            <ActivityIndicator size="small" color="#006341" />
                                        ) : (
                                            <Feather name="chevron-right" size={18} color="#858A95" />
                                        )}
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}

                    <Pressable
                        disabled={isPending}
                        onPress={onClose}
                        className="mt-3 h-12 items-center justify-center rounded-full bg-[#F0F1F3]"
                    >
                        <Text className="text-sm font-semibold text-[#454956]">Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}