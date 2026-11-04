import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type QuickAction = {
    icon: string;
    label: string;
    action: string;
    color: string;
};

type QuickActionsProps = {
    actions: readonly QuickAction[];
    onActionPress?: (action: string) => void;
};

export default function QuickActions({
    actions,
    onActionPress,
}: QuickActionsProps) {
    return (
        <View className="mx-4 -mt-3 flex-row gap-3">
            {actions.map((item) => (
                <Pressable
                    key={item.action}
                    onPress={() => onActionPress?.(item.action)}
                    className="h-[115px] flex-1 items-center justify-center rounded-[22px]
                     border border-gray-200/70 bg-white/50"
                >
                    <View className="mb-1.5 h-10 w-12 items-center justify-center rounded-full ">
                        <Feather
                            name={item.icon as any}
                            size={25}
                            color={item.color}
                        />
                    </View>

                    <Text className="text-center text-[13px] font-medium leading-[17px] text-gray-900">
                        {item.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}