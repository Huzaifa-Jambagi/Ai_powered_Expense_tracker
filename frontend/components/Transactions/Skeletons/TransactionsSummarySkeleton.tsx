import { View, Text } from "react-native";

const SUMMARY_ITEMS = [
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
  { id: "net", label: "Net" },
] as const;

export default function TransactionsSummarySkeleton() {
  return (
    <View className="flex-row items-center rounded-[20px] border border-[#EAEAEA] bg-white px-2 py-3">
      {SUMMARY_ITEMS.map((item, index) => (
        <View key={item.id} className="flex-1 items-center">
          <View className="h-[22px] w-[22px] rounded-full bg-gray-200" />

          <View className="mt-1 h-5 w-20 rounded bg-gray-200" />

          <Text className="text-sm text-gray-600">
            {item.label}
          </Text>

          {index !== SUMMARY_ITEMS.length - 1 && (
            <View className="absolute right-0 h-14 w-px bg-gray-200" />
          )}
        </View>
      ))}
    </View>
  );
}