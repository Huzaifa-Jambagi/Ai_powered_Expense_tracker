
import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

import DashboardSkeleton from "../../components/Dashboard/DashboardSkeleton";
import { useUser } from "../../hooks/useUser";
import { userStorage } from "../../lib/store";

export default function RootGroupLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isLoading } = useUser(isLoaded && isSignedIn);

  useEffect(() => {
    if (!user) return;

    userStorage.setUser(user);
  }, [user]);

  if (!isLoaded || (isSignedIn && (!user || isLoading))) {
    return <DashboardSkeleton />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/signIn" />;
  }

  if (!user.onboarding_completed) {
    return <Redirect href="/(onboarding)/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="assistant" />
    </Stack>
  );
}
