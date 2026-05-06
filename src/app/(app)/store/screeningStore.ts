import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Screening {
  screeningId: string;
  date: string;
  totalScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  status: "COMPLETE" | "UNDER_REVIEW" | "PENDING";
  childPictureUrls: string[];
  createdAt: string;
}

interface ScreeningState {
  // Map of childId -> Screening[]
  screeningsByChild: Record<string, Screening[]>;
  isLoading: boolean;
  error: string | null;
}

interface ScreeningActions {
  setScreenings: (childId: string, screenings: Screening[]) => void;
  addScreening: (childId: string, screening: Screening) => void;
  getScreeningsForChild: (childId: string) => Screening[];
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export type ScreeningStore = ScreeningState & ScreeningActions;

export const useScreeningStore = create<ScreeningStore>()(
  persist(
    (set, get) => ({
      screeningsByChild: {},
      isLoading: false,
      error: null,

      setScreenings: (childId, screenings) =>
        set((state) => ({
          screeningsByChild: {
            ...state.screeningsByChild,
            [childId]: screenings,
          },
          error: null,
        })),

      addScreening: (childId, screening) =>
        set((state) => {
          const existing = state.screeningsByChild[childId] || [];
          return {
            screeningsByChild: {
              ...state.screeningsByChild,
              [childId]: [screening, ...existing],
            },
            error: null,
          };
        }),

      getScreeningsForChild: (childId) => {
        return get().screeningsByChild[childId] || [];
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearAll: () => set({ screeningsByChild: {}, error: null, isLoading: false }),
    }),
    {
      name: "carebridge-screening-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
