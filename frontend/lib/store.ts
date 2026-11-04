import { createMMKV } from "react-native-mmkv";
import getSymbol from "currency-symbol-map";

export const storage = createMMKV();

export interface BackendUser {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  image_url: string | null;
  currency: string;
  created_at: string;
  onboarding_completed: boolean;
}

export interface StoredUser {
  id: string;
  clerk_id: string;
  firstName: string;
  lastName: string;
  email: string;
  image_url: string | null;
  currency: string;
  currency_symbol: string;
  created_at: string;
  onboarding_completed: boolean;
}

export const userStorage = {
  setUser: (user: BackendUser) => {
    const [firstName, ...lastName] = user.name.split(" ");

    storage.set(
      "user",
      JSON.stringify({
        id: user.id,
        clerk_id: user.clerk_id,
        firstName,
        lastName: lastName.join(" "),
        email: user.email,
        image_url: user.image_url,
        currency: user.currency,
        currency_symbol: getSymbol(user.currency) ?? user.currency,
        created_at: user.created_at,
        onboarding_completed: user.onboarding_completed,
      }),
    );
  },

  getUser: (): StoredUser | null => {
    const user = storage.getString("user");
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    storage.remove("user");
  },
};