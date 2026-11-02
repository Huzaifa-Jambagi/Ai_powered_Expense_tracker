import {api} from "./api";

interface OnboardingPayload {
  startingBalance: number;
  currency: string;
}

export const completeOnboarding = async (payload: OnboardingPayload) => {
  
  const { data } = await api.patch("/api/v1/users/onboarding", payload);

  return data.data;
};