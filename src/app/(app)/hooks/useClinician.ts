import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import { Clinician, useClinicianStore } from "../store/clinicianStore";

interface AssignedClinicianResponse {
  message: string;
  child: any;
  clinician: Clinician;
}

export function useAssignedClinician(childId: string | undefined) {
  const { setClinicianForChild, setLoading, setError } = useClinicianStore();

  return useQuery({
    queryKey: ["assigned-clinician", childId],
    queryFn: async () => {
      if (!childId) return null;
      setLoading(true);
      try {
        const response: AssignedClinicianResponse = await apiClient.get(
          `/users/children/${childId}/assigned-clinician`,
        );
        if (response.clinician) {
          setClinicianForChild(childId, response.clinician);
        }
        setLoading(false);
        return response.clinician;
      } catch (error: any) {
        setError(error.message || "Failed to fetch clinician");
        setLoading(false);
        throw error;
      }
    },
    enabled: !!childId,
  });
}
