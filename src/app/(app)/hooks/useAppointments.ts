import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import {
  Appointment,
  CreateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from "../types/appointment";

export function useDoctorAppointments(
  doctorId: string | undefined,
  filters?: { status?: string; from?: string; to?: string },
) {
  return useQuery({
    queryKey: ["doctor-appointments", doctorId, filters],
    queryFn: async () => {
      if (!doctorId) return [];

      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.from) queryParams.append("from", filters.from);
      if (filters?.to) queryParams.append("to", filters.to);

      const qs = queryParams.toString();
      const endpoint = `/appointments/doctors/${doctorId}${qs ? `?${qs}` : ""}`;

      // The markdown says GET /api/doctors/:doctorId/appointments
      // Adjusting endpoint:
      const correctedEndpoint = `/doctors/${doctorId}/appointments${qs ? `?${qs}` : ""}`;

      console.log("Fetching doctor appointments with endpoint:", doctorId);
      const response = await apiClient.get(correctedEndpoint);
      return response as Appointment[];
    },
    enabled: !!doctorId,
  });
}

// GET /api/appointments/:appointmentId
export function useAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      return response as Appointment;
    },
    enabled: !!appointmentId,
  });
}

// PATCH /api/appointments/:appointmentId
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentStatusPayload;
    }) => {
      const response = await apiClient.patch(
        `/appointments/${appointmentId}`,
        payload,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["appointment", variables.appointmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] }); // In case we add this later
    },
  });
}

// POST /api/doctors/:doctorId/appointments
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      payload,
    }: {
      doctorId: string;
      payload: CreateAppointmentPayload;
    }) => {
      const response = await apiClient.post(
        `/doctors/${doctorId}/appointments`,
        payload,
      );
      return response as Appointment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments", variables.doctorId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });
}
