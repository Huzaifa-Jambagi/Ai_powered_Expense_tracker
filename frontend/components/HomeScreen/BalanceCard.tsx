import { Text, View } from "react-native";
import BalanceBackground from "../../assets/images/total_balance_bg.svg";

type BalanceCardProps = {
    totalBalance: number;
    currencySymbol: string;
    budget: number;
    monthExpense: number;
    isBalanceVisible: boolean;
};

export default function BalanceCard({
    totalBalance,
    currencySymbol,
    budget,
    monthExpense,
    isBalanceVisible,
}: BalanceCardProps) {
    const formatAmount = (amount: number) =>
        `${currencySymbol}${Math.abs(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`;

    const budgetAmount = budget;
    const spent = Number(monthExpense);

    const progress = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;

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
                    {isBalanceVisible
                        ? `${totalBalance < 0 ? "-" : ""}${formatAmount(totalBalance)}`
                        : "••••••••"}
                </Text>

                <View className="mt-6 w-full">
                    <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-white/80">
                            Monthly Budget
                        </Text>

                        {budget > 0 ? (
                            <Text className="text-sm font-semibold text-white">
                                {isBalanceVisible
                                    ? `${formatAmount(spent)} / ${formatAmount(budgetAmount)}`
                                    : "•••••• / ••••••"}
                            </Text>
                        ) : (
                            <Text className="text-sm font-medium text-white/80">
                                No budget set
                            </Text>
                        )}
                    </View>

                    {budget > 0 && (
                        <>
                            <View className="h-2 overflow-hidden rounded-full bg-white/25">
                                <View
                                    className="h-full rounded-full bg-white"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>

                            <Text className="mt-2 text-xs font-medium text-white/70">
                                {isBalanceVisible
                                    ? `${Math.round(progress)}% of budget used`
                                    : "••% of budget used"}
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}