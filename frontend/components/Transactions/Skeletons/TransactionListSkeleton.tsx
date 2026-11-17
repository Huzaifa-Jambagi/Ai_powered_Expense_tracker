import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

type TransactionListSkeletonProps = {
  count?: number;
};

export default function TransactionListSkeleton({
  count = 5,
}: TransactionListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          className="mb-2 flex-row items-center rounded-[18px] border border-gray-200/70 bg-white px-3 py-3"
        >
          {/* Category icon placeholder */}
          <View className="h-12 w-12 items-center justify-center rounded-full bg-pink-100">
            <View className="h-6 w-6 rounded-full bg-gray-200" />
          </View>

          {/* Transaction details placeholders */}
          <View className="ml-3 flex-1 justify-center gap-1">
            <View
              className={`h-4 rounded bg-gray-200 ${
                index % 2 === 0 ? "w-28" : "w-24"
              }`}
            />

            <View className="h-3 w-36 rounded bg-gray-200" />
          </View>

          {/* Amount placeholder */}
          <View className="ml-2 h-5 w-24 rounded bg-gray-200" />

          {/* Chevron */}
          <Feather
            name="chevron-right"
            size={22}
            color="#0F172A"
            style={{ marginLeft: 6 }}
          />
        </View>
      ))}
    </View>
  );
}
