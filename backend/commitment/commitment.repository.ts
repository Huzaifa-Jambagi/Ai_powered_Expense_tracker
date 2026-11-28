import { and, desc, eq, lt, sql } from "drizzle-orm";

import { commitments } from "../db/schema/commitments.js";
import { db } from "../db/db.js";
import { transactions } from "../db/schema/transactions.js";
import { accounts } from "../db/schema/accounts.js";

import type {
    CreateCommitmentInput,
    SettleCommitmentInput,
    UpdateCommitmentInput,
} from "./commitment.validation.js";

const throwError = (message: string, statusCode: number): never => {
    throw Object.assign(new Error(message), { statusCode });
};

const toCents = (value: string | number) => {
    const [whole, fraction = ""] = String(value).split(".");
    return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
};

const fromCents = (value: number) =>
    `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;

const withRemainingAmount = (commitment: typeof commitments.$inferSelect) => {
    const amount = toCents(commitment.amount);
    const settled = toCents(commitment.settled_amount);
    const remaining = amount - settled;

    return {
        ...commitment,
        remaining_amount: fromCents(remaining),
        settlement_status: remaining === 0 ? "SETTLED" : settled === 0 ? "PENDING" : "PARTIAL",
    };
};

// GET /commitments
export const getCommitments = async (userId: string) => {
    const items = await db.select()
        .from(commitments)
        .where(and(
            eq(commitments.user_id, userId),
            lt(commitments.settled_amount, commitments.amount),
        ))
        .orderBy(desc(commitments.created_at), desc(commitments.id));

    const summary = {
        toPay: { amount: 0, count: 0 },
        toReceive: { amount: 0, count: 0 },
    };

    const result = items.map(commitment => {
        const amount = toCents(commitment.amount);
        const settled = toCents(commitment.settled_amount);
        const remaining = amount - settled;

        const total = commitment.type === "PAY" ? summary.toPay : summary.toReceive;
        total.amount += remaining;
        total.count += 1;

        return {
            ...commitment,
            remaining_amount: fromCents(remaining),
            settlement_status: settled === 0 ? "PENDING" : "PARTIAL",
        };
    });

    summary.toPay.amount = Number(fromCents(summary.toPay.amount));
    summary.toReceive.amount = Number(fromCents(summary.toReceive.amount));

    return {
        commitments: result,
        summary: {
            toPay: { ...summary.toPay, amount: fromCents(toCents(summary.toPay.amount)) },
            toReceive: { ...summary.toReceive, amount: fromCents(toCents(summary.toReceive.amount)) },
        },
    };
};

// GET /commitments/:commitmentId
export const getCommitmentById = async (userId: string, commitmentId: string) => {
    const [commitment] = await db.select()
        .from(commitments)
        .where(and(
            eq(commitments.id, commitmentId),
            eq(commitments.user_id, userId),
        ));

    if (!commitment) throwError("Commitment not found", 404);

    const history = await db.select()
        .from(transactions)
        .where(and(
            eq(transactions.user_id, userId),
            eq(transactions.commitment_id, commitmentId),
        ))
        .orderBy(desc(transactions.date), desc(transactions.id));

    return {
        ...withRemainingAmount(commitment),
        transactions: history,
    };
};

// POST /commitments
export const createCommitment = async (userId: string, input: CreateCommitmentInput) => {
    const [commitment] = await db.insert(commitments)
        .values({
            user_id: userId,
            name: input.name,
            counterparty: input.counterparty ?? null,
            type: input.type,
            amount: input.amount,
            notes: input.notes ?? null,
        })
        .returning();

    return withRemainingAmount(commitment);
};

// PATCH /commitments/:commitmentId
export const updateCommitment = async (userId: string, commitmentId: string, input: UpdateCommitmentInput) => {
    const updates: Partial<typeof commitments.$inferInsert> = {
        updated_at: new Date(),
    };

    if (input.name !== undefined) updates.name = input.name;
    if (input.counterparty !== undefined) updates.counterparty = input.counterparty;
    if (input.amount !== undefined) updates.amount = input.amount;
    if (input.notes !== undefined) updates.notes = input.notes;

    const conditions = input.amount === undefined
        ? and(
            eq(commitments.id, commitmentId),
            eq(commitments.user_id, userId),
        )
        : and(
            eq(commitments.id, commitmentId),
            eq(commitments.user_id, userId),
            sql`${input.amount}::numeric >= ${commitments.settled_amount}`,
        );

    const [updated] = await db.update(commitments)
        .set(updates)
        .where(conditions)
        .returning();

    if (updated) return withRemainingAmount(updated);

    const [existing] = await db.select({ id: commitments.id })
        .from(commitments)
        .where(and(
            eq(commitments.id, commitmentId),
            eq(commitments.user_id, userId),
        ));

    if (!existing) throwError("Commitment not found", 404);

    throwError("Commitment amount cannot be less than the amount already settled.", 409);
};

// POST /commitments/:commitmentId/settle
export const settleCommitment = async (userId: string, commitmentId: string, input: SettleCommitmentInput) => {
    return db.transaction(async tx => {
        const now = new Date();

        const [commitment] = await tx.update(commitments)
            .set({
                settled_amount: sql`${commitments.settled_amount} + ${input.amount}::numeric`,
                updated_at: now,
            })
            .where(and(
                eq(commitments.id, commitmentId),
                eq(commitments.user_id, userId),
                sql`${commitments.settled_amount} + ${input.amount}::numeric <= ${commitments.amount}`,
            ))
            .returning();

        if (!commitment) {
            const [existing] = await tx.select({
                amount: commitments.amount,
                settled_amount: commitments.settled_amount,
            })
                .from(commitments)
                .where(and(
                    eq(commitments.id, commitmentId),
                    eq(commitments.user_id, userId),
                ));

            if (!existing) throwError("Commitment not found", 404);

            const remaining = toCents(existing.amount) - toCents(existing.settled_amount);

            if (remaining === 0) {
                throwError("This commitment has already been fully settled.", 409);
            }

            throwError(`Settlement amount exceeds the remaining amount of ${fromCents(remaining)}.`, 409);
        }

        const transactionType = commitment.type === "PAY" ? "EXPENSE" : "INCOME";

        const [account] = await tx.update(accounts)
            .set({
                balance: commitment.type === "PAY"
                    ? sql`${accounts.balance} - ${input.amount}::numeric`
                    : sql`${accounts.balance} + ${input.amount}::numeric`,
            })
            .where(and(
                eq(accounts.id, input.accountId),
                eq(accounts.user_id, userId),
            ))
            .returning({ id: accounts.id });

        if (!account) throwError("Account not found", 404);

        const [transaction] = await tx.insert(transactions)
            .values({
                user_id: userId,
                account_id: input.accountId,
                commitment_id: commitment.id,
                type: transactionType,
                amount: input.amount,
                category: input.category,
                description: `${commitment.name}${commitment.counterparty ? ` · ${commitment.counterparty}` : ""}`.slice(0, 255),
                date: now,
                status: "COMPLETED",
                input_method: "manual",
                voice_transcript: null,
                is_flagged: false,
                flag_reason: null,
            })
            .returning();

        return {
            commitment: withRemainingAmount(commitment),
            transaction,
        };
    });
};

// DELETE /commitments/:commitmentId
export const deleteCommitment = async (userId: string, commitmentId: string) => {
    await db.transaction(async tx => {
        const [commitment] = await tx.select({ id: commitments.id })
            .from(commitments)
            .where(and(
                eq(commitments.id, commitmentId),
                eq(commitments.user_id, userId),
            ))
            .for("update");

        if (!commitment) throwError("Commitment not found", 404);

        const now = new Date();

        await tx.update(transactions)
            .set({
                commitment_id: null,
                updated_at: now,
            })
            .where(and(
                eq(transactions.user_id, userId),
                eq(transactions.commitment_id, commitmentId),
            ));

        await tx.delete(commitments)
            .where(and(
                eq(commitments.id, commitmentId),
                eq(commitments.user_id, userId),
            ));
    });
};
