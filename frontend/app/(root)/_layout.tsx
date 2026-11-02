import { Slot, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

import DashboardSkeleton from "../../components/Dashboard/DashboardSkeleton";
import { useUser } from "../../hooks/useUser";

export default function RootGroupLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isLoading, refetch } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && !user) {
      refetch();
    }
  }, [isLoaded, isSignedIn, user, refetch]);

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