import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return <Redirect href="/(auth)/signup" />;
}