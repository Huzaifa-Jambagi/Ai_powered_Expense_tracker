import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { userStorage } from "../../lib/store";

export default function AuthLayout() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  if (!isLoaded) return null;

  const user = userStorage.getUser();

  if (isSignedIn && user?.clerk_id === userId) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}