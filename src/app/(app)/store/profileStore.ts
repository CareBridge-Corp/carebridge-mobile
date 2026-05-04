import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "../../(auth)/types";

interface ProfileState {
  profile: User | null;
  setProfile: (profile: User | null) => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
