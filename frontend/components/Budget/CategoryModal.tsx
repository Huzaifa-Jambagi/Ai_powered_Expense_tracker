import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EXPENSE_CATEGORIES, type CategoryKey } from "../../constants/catogories";

type CategoryModalProps = {
    visible: boolean;
    selectedCategory: CategoryKey | null;
    onSelect: (category: CategoryKey) => void;
    onClose: () => void;
};

export default function CategoryModal({
    visible,
    selectedCategory,
    onSelect,
    onClose,
}: CategoryModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <Pressable
                    className="absolute inset-0"
                    onPress={onClose}
                    accessibilityLabel="Close category selector"
                />

                <View className="max-h-[80%] rounded-t-[28px] bg-white px-5 pb-8 pt-3">
                    <View className="mb-6 mt-1 items-center">
                        <View className="h-1.5 w-14 rounded-full bg-gray-300" />
                    </View>

                    <Text className="mb-5 text-[22px] font-bold text-[#111B3A]">
                        Select Category
                    </Text>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 9, paddingBottom: 12 }}
                    >
                        {EXPENSE_CATEGORIES.map((category) => {
                            const isSelected = selectedCategory === category.key;

                            return (
                                <Pressable
                                    key={category.key}
                                    onPress={() => {
                                        onSelect(category.key);
                                        onClose();
                                    }}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isSelected }}
                                    className={`h-16 flex-row items-center rounded-2xl border px-4 ${isSelected
                                            ? "border-[#00834F] bg-[#F0FAF5]"
                                            : "border-[#E8E9EC] bg-white"
                                        }`}
                                >
                                    <View
                                        className="h-11 w-11 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: `${category.color}20`,
                                        }}
                                    >
                                        <Text className="text-[23px]">
                                            {category.icon}
                                        </Text>
                                    </View>

                                    <Text className="ml-4 flex-1 text-[15px] font-semibold text-[#111B3A]">
                                        {category.label}
                                    </Text>

                                    <View
                                        className={`h-7 w-7 items-center justify-center rounded-full ${isSelected
                                                ? "bg-[#00834F]"
                                                : "border-2 border-[#B8BBC2]"
                                            }`}
                                    >
                                        {isSelected && (
                                            <Feather name="check" size={17} color="white" />
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
