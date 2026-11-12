import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useUser } from "./useUser";
import { userStorage } from "../lib/store";

export const useCompleteAuthentication = () => {
  const router = useRouter();
  const { refetch } = useUser(false);
  const [isCompletingAuthentication, setIsCompletingAuthentication] = useState(false);

  const completeAuthentication = async () => {
    setIsCompletingAuthentication(true);

    try {
      const { data: backendUser, error } = await refetch();

      if (error || !backendUser) {
        Alert.alert("Account setup failed", "Unable to fetch your account details. Please try again.");
        return;
      }

      userStorage.setUser(backendUser);

      const user = userStorage.getUser();

      if (!user) {
        Alert.alert("Account setup failed", "Unable to save your account details.");
        return;
      }

      router.replace(user.onboarding_completed ? "/(root)/(tabs)" : "/(onboarding)/onboarding");
    } catch (error) {
      console.error("Authentication completion failed:", error);
      Alert.alert("Account setup failed", "Unable to set up your account. Please try again.");
    } finally {
      setIsCompletingAuthentication(false);
    }
  };

  return { completeAuthentication, isCompletingAuthentication };
};