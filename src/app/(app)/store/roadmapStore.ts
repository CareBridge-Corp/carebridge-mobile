import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Roadmap } from "../types/roadmap";

interface RoadmapState {
  // Map of childId -> Roadmap[]
  roadmapsByChild: Record<string, Roadmap[]>;
  isLoading: boolean;
  error: string | null;
}

interface RoadmapActions {
  setRoadmaps: (childId: string, roadmaps: Roadmap[]) => void;
  getRoadmapsForChild: (childId: string) => Roadmap[];
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export const useRoadmapStore = create<RoadmapState & RoadmapActions>()(
  persist(
    (set, get) => ({
      roadmapsByChild: {},
      isLoading: false,
      error: null,

      setRoadmaps: (childId, roadmaps) =>
        set((state) => ({
          roadmapsByChild: {
            ...state.roadmapsByChild,
            [childId]: roadmaps,
          },
        })),

      getRoadmapsForChild: (childId) => {
        return get().roadmapsByChild[childId] || [];
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearAll: () => set({ roadmapsByChild: {}, error: null }),
    }),
    {
      name: "carebridge-roadmap-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
