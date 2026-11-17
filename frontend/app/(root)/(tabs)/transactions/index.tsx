import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View, type ListRenderItem } from "react-native";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  Transaction,
  TransactionFilters,
  TransactionChartFilters,
  DailyTransactionChart,
} from "../../../../apis/transactionApis";

import { useTransactionsQuery } from "../../../../hooks/useTransactionsQuery";
import { useTransactionChartQuery } from "../../../../hooks/useTransactionChartQuery";

import TransactionsHeader from "../../../../components/Transactions/TransactionsHeader";
import TransactionsSummary from "../../../../components/Transactions/TransactionsSummary";
import TransactionsChart from "../../../../components/Transactions/TransactionsChart";
import TransactionsFilterModal from "../../../../components/Transactions/TransactionsFilterModal";
import TransactionItem from "../../../../components/Transactions/TransactionItem";

import TransactionListSkeleton from "../../../../components/Transactions/Skeletons/TransactionListSkeleton";
import TransactionChartSkeleton from "../../../../components/Transactions/Skeletons/TransactionsChartSkeleton";
import TransactionSummarySkeleton from "../../../../components/Transactions/Skeletons/TransactionsSummarySkeleton";

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_CHART_DATA: DailyTransactionChart[] = [];

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const CONTENT_CONTAINER_STYLE = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 24,
  flexGrow: 1,
};

const keyExtractor = (item: Transaction) => item.id;

export default function TransactionsScreen() {
  const router = useRouter();

  const [filters, setFilters] = useState<TransactionFilters>(() => ({
  month: getCurrentMonth(),
}));

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Transaction query
  const {
    data,
    isLoading,
    isFetching,
    isError,
    hasNextPage,
    fetchNextPage,
  } = useTransactionsQuery(filters);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Chart query
  const chartFilters = useMemo<TransactionChartFilters>(() => ({
    month: filters.month,
    type: filters.type,
    accountId: filters.accountId,
  }), [filters.month, filters.type, filters.accountId]);

  const {
    data: chartQueryData,
    isLoading: isChartLoading,
    isError: isChartError,
  } = useTransactionChartQuery(chartFilters);

  const chartData = chartQueryData ?? EMPTY_CHART_DATA;

  // Flatten paginated transactions
  const transactions = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? EMPTY_TRANSACTIONS,
    [data]
  );

  // Calculate summary from daily chart data
  const summary = useMemo(() => {
    const totals = chartData.reduce(
      (acc, item) => {
        acc.income += Number(item.income) || 0;
        acc.expense += Number(item.expense) || 0;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return {
      ...totals,
      net: totals.income - totals.expense,
    };
  }, [chartData]);

  // Filter modal
  const openFilterModal = useCallback(() => {
    setIsFilterModalVisible(true);
  }, []);

  const closeFilterModal = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  const applyFilters = useCallback((nextFilters: TransactionFilters) => {
    setFilters(nextFilters);
    closeFilterModal();
  }, [closeFilterModal]);

  // Transaction navigation
  const handleTransactionPress = useCallback((transactionId: string) => {
    router.push({
      pathname: "/transactions/[transactionId]",
      params: { transactionId },
    });
  }, [router]);

  // Render transaction
  const renderTransaction = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => (
      <TransactionItem
        transaction={item}
        onPress={() => handleTransactionPress(item.id)}
      />
    ),
    [handleTransactionPress]
  );


  const listHeader = useMemo(
    () => (
      <View className="gap-5">
        <TransactionsHeader onFilterPress={openFilterModal} />

        {isChartLoading ? (
          <>
            <TransactionSummarySkeleton />
            <TransactionChartSkeleton />
          </>
        ) : chartQueryData !== undefined ? (
          <>
            <TransactionsSummary
              income={summary.income}
              expense={summary.expense}
              net={summary.net}
            />

            <TransactionsChart data={chartData} />
          </>
        ) : isChartError ? (
          <View className="items-center rounded-[20px] bg-white py-8">
            <Text className="text-sm text-gray-500">
              Failed to load chart data.
            </Text>
          </View>
        ) : null}

        <Text className="mb-3 text-xl font-semibold text-slate-800">
          Transactions
        </Text>
      </View>
    ),
    [
      openFilterModal,
      isChartLoading,
      chartQueryData,
      isChartError,
      summary,
      chartData,
    ]
  );

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? [] : ["top", "left", "right"]}
      className="flex-1 bg-[#F8F8F7]"
    >
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : data !== undefined ? (
            <View className="items-center py-12">
              <Text className="text-sm text-gray-500">
                No transactions found.
              </Text>
            </View>
          ) : isError ? (
            <View className="items-center py-12">
              <Text className="text-sm text-gray-500">
                Failed to load transactions.
              </Text>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}
      />

      <TransactionsFilterModal
        visible={isFilterModalVisible}
        filters={filters}
        onClose={closeFilterModal}
        onApply={applyFilters}
      />
    </SafeAreaView>
  );
}