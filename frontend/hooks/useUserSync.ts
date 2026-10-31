import { useEffect } from "react";
import { useUser } from "@clerk/expo";
import { userStorage } from "../lib/store";

export function useUserSync() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      userStorage.clearUser();
      return;
    }

    userStorage.setUser({
      clerkId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      imageUrl: user.imageUrl,
      currency: userStorage.getUser()?.currency ?? "INR",
    });
  }, [isLoaded, isSignedIn, user?.id]);
}