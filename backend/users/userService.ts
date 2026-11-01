import * as userRepository from "./userRepository.js";

export const getUserDetails = async (clerkId: string) => {
  const user = await userRepository.getUserDetails(clerkId);

  return user;
};