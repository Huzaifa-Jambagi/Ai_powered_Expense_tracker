import { memo, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";

import type { DailyTransactionChart } from "../../apis/transactionApis";
import { userStorage } from "../../lib/store";

type TransactionsChartProps = {
    data: DailyTransactionChart[];
};

const CHART_HEIGHT = 140;
const TICK_COUNT = 6;
const Y_AXIS_WIDTH = 34;
const MIN_ITEM_WIDTH = 42;

const AXIS_UNITS = [
    { size: 1e9, suffix: "B" },
    { size: 1e6, suffix: "M" },
    { size: 1e3, suffix: "K" },
];

const getNiceStep = (value: number) => {
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;

    const multiplier =
        normalized <= 1 ? 1 :
        normalized <= 2 ? 2 :
        normalized <= 2.5 ? 2.5 :
        normalized <= 5 ? 5 : 10;

    return multiplier * magnitude;
};

const formatAxisValue = (value: number) => {
    const unit = AXIS_UNITS.find(({ size }) => value >= size);
    const scaled = unit ? value / unit.size : value;

    return `${Number(scaled.toFixed(2))}${unit?.suffix ?? ""}`;
};

const formatCurrency = (value: number, currencySymbol: string) =>
    `${currencySymbol}${value.toLocaleString("en-IN")}`;

const formatFullDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
    });
};

const getDateLabel = (dateString: string, index: number) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return index === 0
        ? new Date(year, month - 1, day).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
          })
        : String(day);
};

function TransactionsChart({ data }: TransactionsChartProps) {
    const { width } = useWindowDimensions();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const currencySymbol = userStorage.getUser()?.currency_symbol ?? "₹";

    const { ticks, bars } = useMemo(() => {
        const parsed = data.map((item) => ({
            date: item.date,
            income: Math.max(0, Number(item.income) || 0),
            expense: Math.max(0, Number(item.expense) || 0),
        }));

        const maxValue = parsed.reduce(
            (max, item) => Math.max(max, item.income, item.expense),
            0
        );

        const step = getNiceStep(maxValue > 0 ? maxValue / TICK_COUNT : 1);
        const axisMax = step * TICK_COUNT;

        return {
            ticks: Array.from({ length: TICK_COUNT + 1 }, (_, index) => ({
                label: formatAxisValue(step * (TICK_COUNT - index)),
                top: (index / TICK_COUNT) * CHART_HEIGHT,
            })),
            bars: parsed.map((item, index) => ({
                date: item.date,
                label: getDateLabel(item.date, index),
                income: item.income,
                expense: item.expense,
                incomeHeight: (item.income / axisMax) * CHART_HEIGHT,
                expenseHeight: (item.expense / axisMax) * CHART_HEIGHT,
            })),
        };
    }, [data]);

    if (!bars.length) {
        return (
            <View className="rounded-[20px] border border-gray-200/70 bg-white p-4">
                <Text className="text-base font-bold text-slate-950">
                    Daily income vs expense
                </Text>

                <View className="items-center justify-center py-12">
                    <Text className="text-sm text-gray-500">
                        No chart data available.
                    </Text>
                </View>
            </View>
        );
    }

    const chartWidth = Math.max(width - 98, bars.length * MIN_ITEM_WIDTH);
    const itemWidth = chartWidth / bars.length;
    const selected = bars.find((bar) => bar.date === selectedDate);

    return (
        <View className="rounded-[20px] border border-[#EAEAEA] bg-white p-4">
            {/* Chart heading and legend */}
            <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-base font-bold text-slate-950">
                    Daily income vs expense
                </Text>

                <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                        <View className="h-2.5 w-2.5 rounded-full bg-green-600" />
                        <Text className="text-xs text-slate-700">Income</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <Text className="text-xs text-slate-700">Expense</Text>
                    </View>
                </View>
            </View>

            <View className="flex-row">
                {/* Y-axis */}
                <View style={{ width: Y_AXIS_WIDTH, height: CHART_HEIGHT }}>
                    {ticks.map((tick) => (
                        <Text
                            key={tick.top}
                            style={{ top: tick.top - 7 }}
                            className="absolute right-1 text-[11px] text-slate-700"
                        >
                            {tick.label}
                        </Text>
                    ))}
                </View>

                {/* Chart area */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={{ width: chartWidth }}>
                        {/* Bars and grid lines */}
                        <View style={{ height: CHART_HEIGHT }} className="flex-row">
                            {ticks.map((tick) => (
                                <View
                                    key={tick.top}
                                    style={{ top: Math.min(tick.top, CHART_HEIGHT - 1) }}
                                    className="absolute left-0 right-0 h-px bg-gray-200"
                                />
                            ))}

                            {bars.map((bar) => (
                                <Pressable
                                    key={bar.date}
                                    onPress={() =>
                                        setSelectedDate((current) =>
                                            current === bar.date ? null : bar.date
                                        )
                                    }
                                    style={{ width: itemWidth }}
                                    className={`h-full flex-row items-end justify-center gap-[3px] rounded-lg ${
                                        bar.date === selectedDate ? "bg-gray-100/60" : ""
                                    }`}
                                >
                                    <View
                                        style={{ height: bar.incomeHeight }}
                                        className="w-[10px] rounded-t-[5px] bg-green-600"
                                    />
                                    <View
                                        style={{ height: bar.expenseHeight }}
                                        className="w-[10px] rounded-t-[5px] bg-red-500"
                                    />
                                </Pressable>
                            ))}
                        </View>

                        {/* X-axis labels */}
                        <View className="mt-2 flex-row">
                            {bars.map((bar) => (
                                <Text
                                    key={bar.date}
                                    style={{ width: itemWidth }}
                                    className="text-center text-xs font-medium text-slate-800"
                                >
                                    {bar.label}
                                </Text>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Selected day breakdown */}
            {selected && (
                <View className="mt-4 rounded-xl bg-gray-50 p-3">
                    <Text className="text-sm font-bold text-slate-950">
                        {formatFullDate(selected.date)}
                    </Text>

                    <View className="mt-2 flex-row gap-8">
                        <View>
                            <Text className="text-xs text-slate-500">Income</Text>
                            <Text className="text-sm font-semibold text-green-600">
                                {formatCurrency(selected.income, currencySymbol)}
                            </Text>
                        </View>

                        <View>
                            <Text className="text-xs text-slate-500">Expense</Text>
                            <Text className="text-sm font-semibold text-red-500">
                                {formatCurrency(selected.expense, currencySymbol)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

export default memo(TransactionsChart);