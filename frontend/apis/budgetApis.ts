import { api } from "./api";

export type Budget = {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    last_alert_sent: string | null;
    last_alert_threshold: number | null;
    created_at: string;
    updated_at: string;
    spent: number;
    remaining: number;
    percentage: number;
};

export type GetBudgetResponse = {
    success: boolean;
    data: Budget[];
    message: string;
};

export const getBudget = async (): Promise<GetBudgetResponse> => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const response = await api.get(`/api/v1/budgets/get-budget/${date}`);
    return response.data;
};

export const setBudget = async (category: string, amount: number) => {
    const response = await api.post("/api/v1/budgets/set-budget", {
        category,
        amount,
    });

    return response.data;
};