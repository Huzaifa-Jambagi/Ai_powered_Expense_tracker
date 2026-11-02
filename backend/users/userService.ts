import * as userRepository from "./userRepository.js";

export const getUserDetails = async (clerkId: string) => {
  const user = await userRepository.getUserDetails(clerkId);

  return user;
};

export const completeOnboarding = async (clerkId: string, startingBalance: number, currency: string) => {
  return await userRepository.completeOnboarding(clerkId, startingBalance, currency);
};