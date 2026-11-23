import { Feather } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useMemo, useState } from "react";

import { subscriptionCompanies } from "../../constants/subscriptionCompanies";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelect: (company: string) => void;
    onManual: () => void;
};

export default function CompanyPickerModal({ visible, onClose, onSelect, onManual }: Props) {
    const [search, setSearch] = useState("");

    const filteredCompanies = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return subscriptionCompanies;

        return subscriptionCompanies.filter(company => company.name.toLowerCase().includes(query));
    }, [search]);

    const close = () => {
        setSearch("");
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
            <View className="flex-1 justify-end bg-black/35">
                <View className="max-h-[82%] rounded-t-[28px] bg-white px-5 pb-8 pt-3">
                    {/* Handle */}
                    <View className="mb-5 items-center">
                        <View className="h-1 w-10 rounded-full bg-[#C5C8CE]" />
                    </View>

                    {/* Header */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-[#171B25]">
                            Choose a company
                        </Text>

                        <Pressable onPress={close} hitSlop={10}>
                            <Feather name="x" size={23} color="#171B25" />
                        </Pressable>
                    </View>

                    {/* Search */}
                    <View className="mb-3 h-11 flex-row items-center rounded-2xl bg-[#F1F2F4] px-3.5">
                        <Feather name="search" size={17} color="#737986" />

                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search companies..."
                            placeholderTextColor="#8A8F99"
                            className="ml-3 flex-1 text-sm text-[#171B25]"
                            autoCorrect={false}
                        />

                        {search.length > 0 && (
                            <Pressable onPress={() => setSearch("")}>
                                <Feather name="x-circle" size={17} color="#8A8F99" />
                            </Pressable>
                        )}
                    </View>

                    {/* Company list */}
                    <FlatList
                        data={filteredCompanies}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => {
                                    onSelect(item.name);
                                    close();
                                }}
                                className="h-[49px] flex-row items-center border-b border-[#F0F0F0]"
                            >
                                <View className="mr-3 h-8 w-8 items-center justify-center">
                                    {"Icon" in item ? (
                                        <item.Icon size={26} color="default" />) : (
                                        <Text className="text-xs font-bold text-[#171B25]">
                                            {item.name.charAt(0)}
                                        </Text>
                                    )}
                                </View>

                                <Text className="flex-1 text-sm font-medium text-[#171B25]">
                                    {item.name}
                                </Text>

                                <Feather name="chevron-right" size={19} color="#7C818B" />
                            </Pressable>
                        )}
                        ListEmptyComponent={
                            <View className="items-center py-8">
                                <Text className="text-sm text-[#858A95]">
                                    No companies found
                                </Text>
                            </View>
                        }
                    />

                    {/* Manual entry */}
                    <Pressable
                        onPress={() => {
                            onManual();
                            close();
                        }}
                        className="mt-3 h-11 flex-row items-center justify-center rounded-full bg-[#E2F3E9]"
                    >
                        <Feather name="edit-2" size={15} color="#176341" />
                        <Text className="ml-2 text-xs font-semibold text-[#176341]">
                            Can't find it? Enter manually
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}