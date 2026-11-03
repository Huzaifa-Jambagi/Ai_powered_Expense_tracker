import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

export interface StoredUser {
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string|null;
  currency: string;
}

export const userStorage = {
  setUser: (user: StoredUser) => {
    storage.set("user", JSON.stringify(user));
  },

  getUser: (): StoredUser | null => {
    const user = storage.getString("user");
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    storage.remove("user");
  },
};
