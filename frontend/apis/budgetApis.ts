import { api } from "./api";

export type Budget = {
    id: string;
    user_id: string;
    amount: number;
    last_alert_sent: string | null;
    created_at: string;
    updated_at: string;
};

export const getBudget = async (): Promise<Budget | null> => {

    const { data } = await api.get<Budget | null>("api/vi/budgets/get");
        console.log("budget fetched",data)
    return data;
}

export const setBudget = async (amount: number): Promise<Budget> => {

    const { data } = await api.put<Budget>("api/vi/budgets/set", { amount });

    return data;
}