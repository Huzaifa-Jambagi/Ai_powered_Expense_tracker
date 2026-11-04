import { Text, View } from "react-native";
import BalanceBackground from "../../assets/images/total_balance_bg.svg";

type BalanceCardProps = {
    totalBalance: number;
    currencySymbol: string;
    monthIncome: number;
    monthExpense: number;
};

export default function BalanceCard({
    totalBalance,
    currencySymbol,
    monthIncome,
    monthExpense,
}: BalanceCardProps) {
    const formatAmount = (amount: number) =>
        `${currencySymbol}${Math.abs(amount).toLocaleString(undefined, {
            maximumFractionDigits: 2,
        })}`;

    return (
        <View className="relative mx-4 h-[265px] overflow-hidden rounded-[30px]">
            <View className="absolute inset-0">
                <BalanceBackground width="100%" height="100%" />
            </View>

            <View className="z-10 flex-1 items-start justify-center p-5">
                <Text className="text-base font-medium text-white/80">
                    Total Balance
                </Text>

                <Text
                    className="mt-2 text-4xl font-bold text-white"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {`${totalBalance < 0 ? "-" : ""}${formatAmount(totalBalance)}`}
                </Text>

                <View className="mt-4 flex-row items-center gap-2.5">
                    <View className="rounded-full bg-green-800/70 px-4 py-2">
                        <Text className="text-sm font-semibold text-green-300">
                            ↑ {formatAmount(monthIncome)}
                        </Text>
                    </View>

                    <View className="rounded-full bg-red-900/70 px-4 py-2">
                        <Text className="text-sm font-semibold text-red-300">
                            ↓ {formatAmount(monthExpense)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}