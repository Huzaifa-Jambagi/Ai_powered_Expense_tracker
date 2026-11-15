import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";

import type { Transaction } from "../../apis/transactionApis";
import { getCategoryConfig } from "../../constants/catogories";
import { userStorage } from "../../lib/store";

type TransactionItemProps = {
  transaction: Transaction;
  onPress: () => void;
};

const formatAmount = (amount: string, currencySymbol: string) =>
  `${currencySymbol}${Math.abs(Number(amount) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const category = getCategoryConfig(transaction.category);
  const isIncome = transaction.type === "INCOME";
  const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${formatAmount(transaction.amount, currencySymbol)}`}
      className="mb-2 flex-row items-center rounded-[18px] border border-gray-200/70 bg-white px-3 py-3 active:bg-gray-50"
    >
      {/* Category emoji */}
      {/* Category emoji */}
      <View className="h-12 w-12 items-center justify-center rounded-full bg-pink-100">
        <Text className="text-2xl">{category.icon}</Text>
      </View>

      {/* Transaction details */}
      <View className="ml-3 flex-1 justify-center">
        <Text numberOfLines={1} className="text-base font-bold text-slate-950">
          {category.label}
        </Text>
        
        <Text className="mt-1 text-xs text-gray-400">
          {format(new Date(transaction.date), "EEE, dd MMM yyyy · hh:mm a")}
        </Text>
      </View>

      {/* Amount */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        className={`ml-2 text-lg font-bold ${isIncome ? "text-green-600" : "text-rose-600"
          }`}
      >
        {isIncome ? "+" : "-"}
        {formatAmount(transaction.amount, currencySymbol)}
      </Text>

      <Feather
        name="chevron-right"
        size={22}
        color="#0F172A"
        style={{ marginLeft: 6 }}
      />
    </Pressable>
  );
}

export default memo(TransactionItem);