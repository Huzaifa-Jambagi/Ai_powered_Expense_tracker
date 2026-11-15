import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AddTransactionForm from "../../../components/AddTransactions/AddTransactionForm";


export default function AddTransactionsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#F8F8F7]" edges={["top"]}>
            <View className="flex-row items-center gap-4 px-5 py-4">
                <Pressable onPress={() => router.back()} hitSlop={8}>
                    <Feather name="arrow-left" size={24} color="#0F172A" />
                </Pressable>

                <Text className="text-xl font-bold text-slate-950">
                    Add Transaction
                </Text>
            </View>

            <AddTransactionForm />
        </SafeAreaView>
    );
}