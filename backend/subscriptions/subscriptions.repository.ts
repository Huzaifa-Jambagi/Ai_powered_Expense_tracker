import { and, asc, desc, eq, sql } from "drizzle-orm";
import { accounts, subscriptions, transactions } from "../db/schema/index.js";
import { db } from "../db/db.js";
import type { CreateSubscriptionInput, UpdateSubscriptionInput, UpdateSubscriptionStatusInput } from "./subscription.validation.js";

type CreateSubscriptionParams = CreateSubscriptionInput & { user_id: string };
type UpdateSubscriptionParams = UpdateSubscriptionInput & { updated_at: Date };

type PaymentErrorCode = "ACCOUNT_NOT_FOUND" | "SUBSCRIPTION_NOT_ACTIVE" | "BILLING_CYCLE_ALREADY_PROCESSED";

export class SubscriptionRepositoryError extends Error {
    constructor(public readonly code: PaymentErrorCode, message: string) {
        super(message);
        this.name = "SubscriptionRepositoryError";
    }
}

export const getSubscriptions = async (userId: string) => {
    return db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, userId))
        .orderBy(asc(subscriptions.next_billing_date), desc(subscriptions.created_at));
};

export const getSubscriptionById = async (userId: string, subscriptionId: string) => {
    const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(and(
            eq(subscriptions.id, subscriptionId),
            eq(subscriptions.user_id, userId),
        ));

    return subscription ?? null;
};

export const createSubscription = async (params: CreateSubscriptionParams) => {
    const [subscription] = await db
        .insert(subscriptions)
        .values({
            user_id: params.user_id,
            name: params.name,
            amount: params.amount,
            billing_interval: params.billingInterval,
            billing_unit: params.billingUnit,
            next_billing_date: params.nextBillingDate,
        })
        .returning();

    return subscription;
};

export const updateSubscription = async (userId: string, subscriptionId: string, params: UpdateSubscriptionParams) => {
    const [subscription] = await db
        .update(subscriptions)
        .set({
            ...(params.name !== undefined && { name: params.name }),
            ...(params.amount !== undefined && { amount: params.amount }),
            ...(params.billingInterval !== undefined && { billing_interval: params.billingInterval }),
            ...(params.billingUnit !== undefined && { billing_unit: params.billingUnit }),
            ...(params.nextBillingDate !== undefined && { next_billing_date: params.nextBillingDate }),
            updated_at: params.updated_at,
        })
        .where(and(
            eq(subscriptions.id, subscriptionId),
            eq(subscriptions.user_id, userId),
        ))
        .returning();

    return subscription ?? null;
};

export const updateSubscriptionStatus = async (userId: string, subscriptionId: string, status: UpdateSubscriptionStatusInput["status"]) => {
    const [subscription] = await db
        .update(subscriptions)
        .set({
            status,
            updated_at: new Date(),
        })
        .where(and(
            eq(subscriptions.id, subscriptionId),
            eq(subscriptions.user_id, userId),
        ))
        .returning();

    return subscription ?? null;
};

export const deleteSubscription = async (userId: string, subscriptionId: string): Promise<boolean> => {
    const [deletedSubscription] = await db
        .delete(subscriptions)
        .where(and(
            eq(subscriptions.id, subscriptionId),
            eq(subscriptions.user_id, userId),
        ))
        .returning({ id: subscriptions.id });

    return !!deletedSubscription;
};

export const markSubscriptionAsPaid = async (userId: string, subscriptionId: string, accountId: string, expectedNextBillingDate: string) => {
    return db.transaction(async (tx) => {
        const [subscription] = await tx
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.user_id, userId),
            ))
            .for("update");

        if (!subscription) return null;

        if (subscription.status !== "ACTIVE") {
            throw new SubscriptionRepositoryError("SUBSCRIPTION_NOT_ACTIVE", "Only active subscriptions can be marked as paid");
        }

        if (subscription.next_billing_date !== expectedNextBillingDate) {
            throw new SubscriptionRepositoryError("BILLING_CYCLE_ALREADY_PROCESSED", "This billing cycle has already been processed");
        }

        const [account] = await tx
            .update(accounts)
            .set({
                balance: sql`${accounts.balance} - ${subscription.amount}::numeric`,
            })
            .where(and(
                eq(accounts.id, accountId),
                eq(accounts.user_id, userId),
            ))
            .returning({ id: accounts.id });

        if (!account) {
            throw new SubscriptionRepositoryError("ACCOUNT_NOT_FOUND", "Account not found");
        }

        const paidAt = new Date();

        const [transaction] = await tx
            .insert(transactions)
            .values({
                account_id: accountId,
                user_id: userId,
                type: "EXPENSE",
                amount: subscription.amount,
                category: "subscriptions",
                description: subscription.name,
                date: paidAt,
                status: "COMPLETED",
                input_method: "MANUAL",
                voice_transcript: null,
            })
            .returning();

        const nextBillingDate = sql<string>`
            CASE ${subscriptions.billing_unit}
                WHEN 'DAY' THEN (${subscriptions.next_billing_date} + (${subscriptions.billing_interval} * INTERVAL '1 day'))::date
                WHEN 'WEEK' THEN (${subscriptions.next_billing_date} + (${subscriptions.billing_interval} * INTERVAL '1 week'))::date
                WHEN 'MONTH' THEN (${subscriptions.next_billing_date} + make_interval(months => ${subscriptions.billing_interval}))::date
                WHEN 'YEAR' THEN (${subscriptions.next_billing_date} + make_interval(years => ${subscriptions.billing_interval}))::date
            END
        `;

        const [updatedSubscription] = await tx
            .update(subscriptions)
            .set({
                next_billing_date: nextBillingDate,
                updated_at: paidAt,
            })
            .where(and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.user_id, userId),
                eq(subscriptions.next_billing_date, expectedNextBillingDate),
            ))
            .returning();

        if (!updatedSubscription) {
            throw new SubscriptionRepositoryError("BILLING_CYCLE_ALREADY_PROCESSED", "This billing cycle has already been processed");
        }

        return {
            subscription: updatedSubscription,
            transaction,
        };
    });
};