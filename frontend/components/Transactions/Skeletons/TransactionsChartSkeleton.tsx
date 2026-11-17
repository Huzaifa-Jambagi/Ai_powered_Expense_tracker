
import { ScrollView, Text, View, useWindowDimensions } from "react-native";

const CHART_HEIGHT = 140;
const TICK_COUNT = 6;
const Y_AXIS_WIDTH = 34;
const MIN_ITEM_WIDTH = 42;
const BAR_COUNT = 31;

const TICKS = Array.from({ length: TICK_COUNT + 1 }, (_, index) => ({
  id: index,
  top: (index / TICK_COUNT) * CHART_HEIGHT,
}));

// Deterministic placeholder heights for paired bars.
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, index) => ({
  income: 30 + ((index * 31) % 90),
  expense: 20 + ((index * 43) % 75),
}));

export default function TransactionsChartSkeleton() {
  const { width } = useWindowDimensions();

  const chartWidth = Math.max(
    width - 98,
    BAR_COUNT * MIN_ITEM_WIDTH
  );

  const itemWidth = chartWidth / BAR_COUNT;

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
          {TICKS.map((tick) => (
            <View
              key={tick.id}
              style={{ top: tick.top - 4 }}
              className="absolute right-1 h-2 w-5 rounded bg-gray-200"
            />
          ))}
        </View>

        {/* Chart area */}
        <View className="flex-1">
          <View style={{ height: CHART_HEIGHT }} className="flex-row">
            {TICKS.map((tick) => (
              <View
                key={tick.id}
                style={{ top: Math.min(tick.top, CHART_HEIGHT - 1) }}
                className="absolute left-0 right-0 h-px bg-gray-200"
              />
            ))}

            {BAR_HEIGHTS.map((bar, index) => (
              <View
                key={index}
                className="h-full flex-1 flex-row items-end justify-center gap-[3px]"
              >
                <View style={{ height: bar.income }} className="w-[10px] rounded-t-[5px] bg-gray-200" />
                <View style={{ height: bar.expense }} className="w-[10px] rounded-t-[5px] bg-gray-200" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
