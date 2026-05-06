import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import { Screening, useScreeningStore } from "../store/screeningStore";

interface ScreeningsResponse {
  message: string;
  childId: string;
  count: number;
  screenings: Screening[];
}

export function useChildScreenings(childId: string | undefined) {
  const { setScreenings, setLoading, setError } = useScreeningStore();

  return useQuery({
    queryKey: ["screenings", childId],
    queryFn: async () => {
      if (!childId) return null;

      setLoading(true);
      try {
        const response: ScreeningsResponse = await apiClient.get(
          `/screenings/child/${childId}`,
        );
        const screenings = response.screenings || [];
        setScreenings(childId, screenings);
        setLoading(false);
        return response;
      } catch (error: any) {
        setError(error.message || "Failed to fetch screenings");
        setLoading(false);
        throw error;
      }
    },
    enabled: !!childId,
  });
}
