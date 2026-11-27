import * as subscriptionRepository from "./subscriptions.repository.js";
import type {
    CreateSubscriptionInput,
    MarkSubscriptionPaidInput,
    UpdateSubscriptionInput,
    UpdateSubscriptionStatusInput,
} from "./subscription.validation.js";
import { subscriptions } from "../db/schema/subscriptions.js";
import { transactions } from "../db/schema/transactions.js";

type MarkSubscriptionAsPaidResult = {
    subscription: typeof subscriptions.$inferSelect;
    transaction: typeof transactions.$inferSelect;
} | null;

export const getSubscriptions = async (userId: string) => {
    return subscriptionRepository.getSubscriptions(userId);
};

export const getSubscriptionById = async (userId: string, subscriptionId: string) => {
    return subscriptionRepository.getSubscriptionById(userId, subscriptionId);
};

export const createSubscription = async (userId: string, input: CreateSubscriptionInput) => {
    return subscriptionRepository.createSubscription({
        ...input,
        user_id: userId,
    });
};

export const updateSubscription = async (userId: string, subscriptionId: string, input: UpdateSubscriptionInput) => {
    return subscriptionRepository.updateSubscription(userId, subscriptionId, {
        ...input,
        updated_at: new Date(),
    });
};

export const updateSubscriptionStatus = async (userId: string, subscriptionId: string, status: UpdateSubscriptionStatusInput["status"]) => {
    return subscriptionRepository.updateSubscriptionStatus(userId, subscriptionId, status);
};

export const deleteSubscription = async (userId: string, subscriptionId: string) => {
    return subscriptionRepository.deleteSubscription(userId, subscriptionId);
};

export const markSubscriptionAsPaid = (userId: string, subscriptionId: string, input: MarkSubscriptionPaidInput) => {
    return subscriptionRepository.markSubscriptionAsPaid(userId, subscriptionId, input.accountId);
};