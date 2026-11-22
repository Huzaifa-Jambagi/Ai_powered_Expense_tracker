import { api } from "./api";

export type UserDetails = {
    id: string;
    clerk_id: string;
    name: string;
    email: string;
    image_url: string | null;
    currency: string;
    created_at: string;
    onboarding_completed: boolean;
};

type UserDetailsResponse = {
    success: boolean;
    data: UserDetails;
    message: string;
};

export const getUserDetails = async (): Promise<UserDetails> => {
    const { data } = await api.get<UserDetailsResponse>("/api/v1/users/get");
    return data.data;
};

export const updateUserCurrency = async (currency: string): Promise<UserDetails> => {
    const { data } = await api.patch<UserDetailsResponse>("/api/v1/users/currency", { currency });
    return data.data;
};