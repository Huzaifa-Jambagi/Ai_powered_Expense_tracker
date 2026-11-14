import { api } from "./api";
import type { BackendUser } from "../lib/store";


interface OnboardingPayload {
  startingBalance: number;
  currency: string;
}

export const completeOnboarding = async (payload: OnboardingPayload): Promise<BackendUser> => {
  const { data } = await api.patch<{ data: BackendUser }>("/api/v1/users/onboarding", payload);
  return data.data;
};