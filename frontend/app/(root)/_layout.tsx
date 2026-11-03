import { Slot, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

import DashboardSkeleton from "../../components/Dashboard/DashboardSkeleton";
import { useUser } from "../../hooks/useUser";
import { userStorage } from "../../lib/store";

export default function RootGroupLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isLoading, refetch } = useUser();
  const userId = user

  useEffect(() => {
    if (isLoaded && isSignedIn && !user) {
      refetch();
    }
  }, [isLoaded, isSignedIn, user, refetch]);

  useEffect(() => {
    if (!user || !userId) return;

    const [firstName, ...lastNameParts] = user.name.split(" ");

    userStorage.setUser({
      clerkId: user.clerk_id,
      firstName: firstName || null,
      lastName: lastNameParts.join(" ") || null,
      email: user.email,
      imageUrl: user.image_url,
      currency: user.currency,
    });
  }, [user, userId]);

  if (!isLoaded || (isSignedIn && (!user || isLoading))) {
    return <DashboardSkeleton />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/signIn" />;
  }

  if (!user.onboarding_completed) {
    return <Redirect href="/(onboarding)/onboarding" />;
  }

  return <Slot />;
}