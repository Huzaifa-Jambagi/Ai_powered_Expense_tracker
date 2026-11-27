import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
    isActive: boolean;
    isAlreadyPaid: boolean;
    isPaying: boolean;
    isUpdatingStatus: boolean;
    isDeleting: boolean;
    onMarkAsPaid: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
};

function SubscriptionDetailsActions({
    isActive,
    isPaying,
    isAlreadyPaid,
    isUpdatingStatus,
    isDeleting,
    onMarkAsPaid,
    onToggleStatus,
    onDelete,
}: Props) {
    return (
        <View className="mx-5 mt-5 gap-3">
            {isActive && (
                <Pressable
                    onPress={onMarkAsPaid}
                    disabled={isPaying || isAlreadyPaid}
                    className={`h-[52px] flex-row items-center justify-center rounded-2xl ${isAlreadyPaid ? "bg-[#E8F3EE]" : "bg-[#006341]"
                        }`}
                >
                    {isPaying ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Feather name="check-circle" size={19} color={isAlreadyPaid ? "#006341" : "#FFFFFF"} />
                            <Text className={`ml-2 text-sm font-bold ${isAlreadyPaid ? "text-[#006341]" : "text-white"}`}>
                                {isAlreadyPaid ? "Already Paid" : "Mark as Paid"}
                            </Text>
                        </>
                    )}
                </Pressable>
            )}

            <Pressable
                onPress={onToggleStatus}
                disabled={isUpdatingStatus}
                className="h-[49px] flex-row items-center justify-center rounded-2xl bg-[#EAE8FF]"
            >
                {isUpdatingStatus ? (
                    <ActivityIndicator color="#5547A4" />
                ) : (
                    <>
                        <Feather
                            name={isActive ? "pause-circle" : "play-circle"}
                            size={18}
                            color="#5547A4"
                        />
                        <Text className="ml-2 text-sm font-semibold text-[#40377A]">
                            {isActive ? "Pause Subscription" : "Resume Subscription"}
                        </Text>
                    </>
                )}
            </Pressable>

            <Pressable
                onPress={onDelete}
                disabled={isDeleting}
                className="h-[49px] flex-row items-center justify-center rounded-2xl bg-[#FCEEEF]"
            >
                {isDeleting ? (
                    <ActivityIndicator color="#C53D49" />
                ) : (
                    <>
                        <Feather name="trash-2" size={17} color="#C53D49" />
                        <Text className="ml-2 text-sm font-semibold text-[#C53D49]">
                            Delete Subscription
                        </Text>
                    </>
                )}
            </Pressable>
        </View>
    );
}

export default memo(SubscriptionDetailsActions);