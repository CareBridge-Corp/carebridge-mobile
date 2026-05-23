import { apiClient } from "@/shared/api/client";
import { useQuery } from "@tanstack/react-query";
import {
  ActiveRoadmapData,
  normalizeWeekPlansResponse,
  WeekPlansResponse,
} from "../types/roadmap";

export const useRoadmaps = (childId?: string) => {
  return useQuery<ActiveRoadmapData>({
    queryKey: ["roadmaps", childId],
    queryFn: async () => {
      if (!childId) {
        return { roadmap: null, weekPlans: [], hasActiveRoadmap: false };
      }

      try {
        const response = await apiClient.get<WeekPlansResponse>(
          `/roadmaps/${childId}/week-plans`,
        );
        return normalizeWeekPlansResponse(response, childId);
      } catch {
        return { roadmap: null, weekPlans: [], hasActiveRoadmap: false };
      }
    },
    enabled: !!childId,
  });
};
