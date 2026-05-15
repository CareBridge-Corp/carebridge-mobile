import { apiClient } from "@/shared/api/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRoadmapStore } from "../store/roadmapStore";
import { RoadmapResponse } from "../types/roadmap";

export const useRoadmaps = (childId?: string) => {
  const setRoadmaps = useRoadmapStore((state) => state.setRoadmaps);

  const query = useQuery({
    queryKey: ["roadmaps", childId],
    queryFn: async () => {
      if (!childId) return null;
      // Using the exact endpoint from the requirement
      const response = await apiClient.get<RoadmapResponse>(
        `/roadmaps/${childId}/week-plans`,
      );
      return response;
    },
    enabled: !!childId,
  });

  useEffect(() => {
    if (query.data?.roadmaps && childId) {
      setRoadmaps(childId, query.data.roadmaps);
    }
  }, [query.data, childId, setRoadmaps]);

  return query;
};
