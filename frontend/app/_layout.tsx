import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot } from 'expo-router'
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css"
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from '../lib/query/queryClient';
import ApiInterceptor from "../components/ApiInterceptor"

SplashScreen.preventAutoHideAsync().catch(console.warn);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!


if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} >
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <ApiInterceptor />
          <SafeAreaProvider>
            <Slot />
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  )
}


