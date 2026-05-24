import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import {
  Appointment,
  AvailableSlot,
  CreateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from "../types/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAvailableSlots(
  doctorId: string | undefined,
  date: string | undefined,
  meetingType: "in_person" | "online" = "in_person",
) {
  return useQuery({
    queryKey: ["available-slots", doctorId, date, meetingType],
    queryFn: async () => {
      if (!doctorId || !date) return [] as AvailableSlot[];

      const response = await apiClient.get<{
        date: string;
        meeting_type: string;
        appointment_duration_min: number;
        slots: AvailableSlot[];
      }>(
        `/doctors/${doctorId}/available-slots?date=${date}&meeting_type=${meetingType}`,
      );

      return (response.slots ?? []).filter((slot) => slot.is_available);
    },
    enabled: !!doctorId && !!date,
  });
}

export interface AvailableDay {
  date: string;
  day_of_week: number;
  total_slots: number;
  available_slots: number;
  first_slot?: string;
  last_slot?: string;
  is_available: boolean;
}

export function useAvailableDays(
  doctorId: string | undefined,
  from: string | undefined,
  to: string | undefined,
  meetingType: "in_person" | "online" = "in_person",
) {
  return useQuery({
    queryKey: ["available-days", doctorId, from, to, meetingType],
    queryFn: async () => {
      if (!doctorId || !from || !to) return [] as AvailableDay[];

      const response = await apiClient.get<{
        doctor_id: string;
        from: string;
        to: string;
        meeting_type: string;
        days: AvailableDay[];
      }>(
        `/doctors/${doctorId}/available-days?from=${from}&to=${to}&meeting_type=${meetingType}`,
      );

      return response.days ?? [];
    },
    enabled: !!doctorId && !!from && !!to,
  });
}

export function useDoctorAppointments(
  doctorId: string | undefined,
  filters?: { status?: string; from?: string; to?: string },
) {
  return useQuery({
    queryKey: ["doctor-appointments", doctorId, filters],
    queryFn: async () => {
      if (!doctorId) return [] as Appointment[];

      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.from) queryParams.append("from", filters.from);
      if (filters?.to) queryParams.append("to", filters.to);

      const qs = queryParams.toString();
      const response = await apiClient.get<{ appointments: Appointment[] }>(
        `/doctors/${doctorId}/appointments/parent${qs ? `?${qs}` : ""}`,
      );
      return response.appointments ?? [];
    },
    enabled: !!doctorId,
  });
}

export function useAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const response = await apiClient.get<{ appointment: Appointment }>(
        `/appointments/${appointmentId}`,
      );
      return response.appointment;
    },
    enabled: !!appointmentId,
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentStatusPayload;
    }) => apiClient.patch(`/appointments/${appointmentId}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["appointment", variables.appointmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
    },
  });
}

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
      const response = await apiClient.post<{ appointment: Appointment }>(
        `/doctors/${doctorId}/appointments`,
        payload,
      );
      return response.appointment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments", variables.doctorId],
      });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
