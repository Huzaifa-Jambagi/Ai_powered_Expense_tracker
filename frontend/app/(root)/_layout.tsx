import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

import { userStorage } from "../../lib/store";

export default function RootGroupLayout() {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();

  const user = userStorage.getUser();
  const hasMatchingUser = Boolean(userId && user?.clerk_id === userId);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasMatchingUser) return;

    userStorage.clearUser();

    void signOut().catch((error) => {
      console.error("Failed to sign out user:", error);
    });
  }, [isLoaded, isSignedIn, userId, hasMatchingUser, signOut]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/signIn" />;
  }

  if (!user || user.clerk_id !== userId) return null;

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