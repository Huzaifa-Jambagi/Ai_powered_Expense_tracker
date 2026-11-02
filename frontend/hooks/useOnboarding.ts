import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../apis/oboardingApi";
import { Alert } from "react-native";

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOnboarding,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },

     onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });
};