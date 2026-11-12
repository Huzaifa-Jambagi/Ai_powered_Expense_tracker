import { getMonthDateRange } from "../date.js";
import { getExpenseBreakdownRepo, getTransactionChart as getTransactionChartRepo, getTransactions as getTransactionsRepo } from "./transaction.repository.js";

interface GetTransactionsParams {
    userId: string;
    month: string;
    timezone: string;
    accountId?: string;
    type?: "INCOME" | "EXPENSE";
    limit: number;
    offset: number;
}

interface GetTransactionChartParams {
    userId: string;
    month: string;
    timezone: string;
    accountId?: string;
    type?: "INCOME" | "EXPENSE";
}

export const getTransactions = async (params: GetTransactionsParams) => {
    const { startDate, endDate } = getMonthDateRange(params.month, params.timezone);

    const rows = await getTransactionsRepo({
        ...params,
        startDate,
        endDate,
    });

    const hasMore = rows.length > params.limit;
    const data = hasMore ? rows.slice(0, params.limit) : rows;

    return {
        data,
        pagination: {
            limit: params.limit,
            offset: params.offset,
            hasMore,
            nextOffset: hasMore ? params.offset + params.limit : null,
        },
    };
};

export const getTransactionChart = async (params: GetTransactionChartParams) => {
    const { startDate, endDate } = getMonthDateRange(params.month, params.timezone);

    const rows = await getTransactionChartRepo({
        ...params,
        startDate,
        endDate,
    });

    const [year, month] = params.month.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const dailyData = new Map(rows.map((row) => [row.date, row]));

    return Array.from({ length: daysInMonth }, (_, index) => {
        const date = `${params.month}-${String(index + 1).padStart(2, "0")}`;
        const row = dailyData.get(date);

        return {
            date,
            income: row?.income ?? "0",
            expense: row?.expense ?? "0",
        };
    });
};

export const getExpenseBreakdown = async (params: {
    userId: string;
    month: string;
    timezone: string;
}) => {
    const { startDate, endDate } = getMonthDateRange(params.month, params.timezone);

    return getExpenseBreakdownRepo(params.userId, startDate, endDate);
};