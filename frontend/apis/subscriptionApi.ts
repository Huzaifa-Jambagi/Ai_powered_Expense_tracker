import { api } from "./api";

export type BillingUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
export type SubscriptionStatus = "ACTIVE" | "PAUSED";

export type Subscription = {
    id: string;
    user_id: string;
    name: string;
    amount: string;
    billing_interval: number;
    billing_unit: BillingUnit;
    next_billing_date: string;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
};

export type SubscriptionInput = {
    name: string;
    amount: string;
    billingInterval?: number;
    billingUnit?: BillingUnit;
    nextBillingDate: string;
};

export type UpdateSubscriptionInput = Partial<SubscriptionInput>;

export type SubscriptionResponse = {
    success: boolean;
    data: Subscription;
    message: string;
};

export type GetSubscriptionsResponse = {
    success: boolean;
    data: Subscription[];
    message: string;
};

export type SubscriptionPaymentResult = {
    subscription: Subscription;
    transaction: {
        id: string;
        account_id: string;
        user_id: string;
        type: "EXPENSE";
        amount: string;
        category: string;
        description: string | null;
        date: string;
        status: string;
        input_method: string;
        voice_transcript: string | null;
        created_at: string;
        updated_at: string;
        is_flagged: boolean;
        flag_reason: string | null;
        commitment_id: string | null;
    };
};

export type SubscriptionPaymentResponse = {
    success: boolean;
    data: SubscriptionPaymentResult;
    message: string;
};

export const getSubscriptions = async (): Promise<GetSubscriptionsResponse> => {
    const response = await api.get("/api/v1/subscriptions");
    return response.data;
};

export const getSubscription = async (subscriptionId: string): Promise<SubscriptionResponse> => {
    const response = await api.get(`/api/v1/subscriptions/${subscriptionId}`);
    return response.data;
};

export const createSubscription = async (data: SubscriptionInput): Promise<SubscriptionResponse> => {
    const response = await api.post("/api/v1/subscriptions", data);
    return response.data;
};

export const updateSubscription = async (subscriptionId: string, data: UpdateSubscriptionInput): Promise<SubscriptionResponse> => {
    const response = await api.patch(`/api/v1/subscriptions/${subscriptionId}`, data);
    return response.data;
};

export const updateSubscriptionStatus = async (subscriptionId: string, status: SubscriptionStatus): Promise<SubscriptionResponse> => {
    const response = await api.patch(`/api/v1/subscriptions/${subscriptionId}/status`, { status });
    return response.data;
};

export const markSubscriptionAsPaid = async (subscriptionId: string, accountId: string): Promise<SubscriptionPaymentResponse> => {
    const response = await api.post(`/api/v1/subscriptions/${subscriptionId}/pay`, { accountId });
    return response.data;
};

export const deleteSubscription = async (subscriptionId: string) => {
    const response = await api.delete(`/api/v1/subscriptions/${subscriptionId}`);
    return response.data;
};