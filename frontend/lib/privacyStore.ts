import { create } from "zustand";

type PrivacyStore = {
    isPrivacyModeEnabled: boolean;
    togglePrivacyMode: () => void;
};

export const usePrivacyStore = create<PrivacyStore>()(set => ({
    isPrivacyModeEnabled: false,
    togglePrivacyMode: () => set(state => ({
        isPrivacyModeEnabled: !state.isPrivacyModeEnabled,
    })),
}));