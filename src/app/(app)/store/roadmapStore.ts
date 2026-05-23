import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import client from "../../../shared/api/client";
import { WeekPlan } from "../types/roadmap";

interface RoadmapState {
  weekPlansByChild: Record<string, WeekPlan[]>;
  isLoading: boolean;
  error: string | null;
}

interface RoadmapActions {
  setWeekPlans: (childId: string, weekPlans: WeekPlan[]) => void;
  getWeekPlansForChild: (childId: string) => WeekPlan[];
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
  completeActivity: (weekPlanId: string, activityId: string) => Promise<void>;
}

export const useRoadmapStore = create<RoadmapState & RoadmapActions>()(
  persist(
    (set, get) => ({
      weekPlansByChild: {},
      isLoading: false,
      error: null,

      setWeekPlans: (childId, weekPlans) =>
        set((state) => ({
          weekPlansByChild: {
            ...state.weekPlansByChild,
            [childId]: weekPlans,
          },
        })),

      getWeekPlansForChild: (childId) => {
        return get().weekPlansByChild[childId] || [];
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearAll: () => set({ weekPlansByChild: {}, error: null }),
      completeActivity: async (weekPlanId, activityId) => {
        try {
          await client.post(
            `/users/week-plans/${weekPlanId}/activities/${activityId}/complete`,
          );
        } catch (error) {
          console.error("Error completing activity:", error);
          throw error;
        }
      },
    }),
    {
      name: "carebridge-roadmap-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
