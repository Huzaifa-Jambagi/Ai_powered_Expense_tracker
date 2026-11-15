import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { CategoryKey } from "../../constants/catogories";

type CategoryPickerModalProps = {
    visible: boolean;
    title: string;
    categories: readonly { key: CategoryKey; label: string; icon: string }[];
    selectedKey: CategoryKey;
    selectedColor: string;
    onSelect: (key: CategoryKey) => void;
    onClose: () => void;
};

export default function CategoryPickerModal({
    visible,
    title,
    categories,
    selectedKey,
    selectedColor,
    onSelect,
    onClose,
}: CategoryPickerModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <Pressable className="flex-1" onPress={onClose} />

                <View className="max-h-[70%] rounded-t-[28px] bg-white px-5 pb-8 pt-4">
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-slate-950">
                            {title}
                        </Text>

                        <Pressable
                            onPress={onClose}
                            hitSlop={8}
                            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                        >
                            <Feather name="x" size={20} color="#0F172A" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="flex-row flex-wrap gap-2">
                            {categories.map((category) => {
                                const selected = selectedKey === category.key;

                                return (
                                    <Pressable
                                        key={category.key}
                                        onPress={() => {
                                            onSelect(category.key);
                                            onClose();
                                        }}
                                        className="flex-row items-center gap-2 rounded-full border px-4 py-3"
                                        style={{
                                            backgroundColor: selected ? selectedColor : "#FFFFFF",
                                            borderColor: selected ? selectedColor : "#E5E7EB",
                                        }}
                                    >
                                        <Text>{category.icon}</Text>

                                        <Text className={`text-sm font-medium ${
                                            selected ? "text-white" : "text-slate-950"
                                        }`}>
                                            {category.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}