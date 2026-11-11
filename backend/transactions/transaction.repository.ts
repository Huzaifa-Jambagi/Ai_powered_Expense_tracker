import { and, desc, sql, eq, gte, lt } from "drizzle-orm";
import { accounts, transactions } from "../db/schema/index.js";
import { db } from "../db/db.js";

interface GetTransactionsParams {
    userId: string;
    startDate: Date;
    endDate: Date;
    accountId?: string;
    type?: "INCOME" | "EXPENSE";
    limit: number;
    offset: number;
}

interface GetTransactionChartParams {
    userId: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    accountId?: string;
    type?: "INCOME" | "EXPENSE";
}

export const getTransactions = async (params: GetTransactionsParams) => {
    const conditions = [
        eq(transactions.user_id, params.userId),
        gte(transactions.date, params.startDate),
        lt(transactions.date, params.endDate),
    ];

    if (params.accountId) conditions.push(eq(transactions.account_id, params.accountId));
    if (params.type) conditions.push(eq(transactions.type, params.type));

    return db
        .select({
            id: transactions.id,
            accountId: transactions.account_id,
            accountName: accounts.name,
            type: transactions.type,
            amount: transactions.amount,
            category: transactions.category,
            description: transactions.description,
            date: transactions.date,
            status: transactions.status,
            input_method: transactions.input_method,
            voice_transcript: transactions.voice_transcript,
            is_flagged: transactions.is_flagged,
            flag_reason: transactions.flag_reason,
            created_at: transactions.created_at,
            updated_at: transactions.updated_at,
        })
        .from(transactions)
        .innerJoin(accounts, and(
            eq(transactions.account_id, accounts.id),
            eq(accounts.user_id, params.userId),
        ))
        .where(and(...conditions))
        .orderBy(desc(transactions.date), desc(transactions.id))
        .limit(params.limit + 1)
        .offset(params.offset);
};

export const getTransactionChart = async (params: GetTransactionChartParams) => {
    const conditions = [
        eq(transactions.user_id, params.userId),
        gte(transactions.date, params.startDate),
        lt(transactions.date, params.endDate),
    ];

    if (params.accountId) conditions.push(eq(transactions.account_id, params.accountId));
    if (params.type) conditions.push(eq(transactions.type, params.type));

    const localDate = sql<string>`(${transactions.date} AT TIME ZONE ${params.timezone})::date`;

    return db
        .select({
            date: localDate,
            income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)::text`,
            expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)::text`,
        })
        .from(transactions)
        .where(and(...conditions))
        .groupBy(sql`1`)
        .orderBy(sql`1`);
};
