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

interface AllCliniciansResponse {
  message: string;
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  clinicians: Clinician[];
}

export function useAllClinicians(params?: {
  search?: string;
  limit?: number;
  page?: number;
  enabled?: boolean;
}) {
  const { search = "", limit = 30, page = 1, enabled = true } = params ?? {};
  return useQuery({
    queryKey: ["all-clinicians", search, limit, page],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (search) qs.append("search", search);
      qs.append("limit", String(limit));
      qs.append("page", String(page));
      const response = await apiClient.get<AllCliniciansResponse>(
        `/clinicians?${qs.toString()}`,
      );
      return response;
    },
    enabled,
    staleTime: 60_000,
  });
}

interface ClinicianByIdResponse {
  message: string;
  clinician: Clinician;
}

export function useClinicianById(clinicianId: string | undefined) {
  return useQuery({
    queryKey: ["clinician", clinicianId],
    queryFn: async () => {
      if (!clinicianId) return null;
      const response = await apiClient.get<ClinicianByIdResponse>(
        `/clinicians/${clinicianId}`,
      );
      return response.clinician;
    },
    enabled: !!clinicianId,
    staleTime: 60_000,
  });
}
