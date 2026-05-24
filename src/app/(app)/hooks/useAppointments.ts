import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import {
  Appointment,
  AvailableSlot,
  CreateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from "../types/appointment";

/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useAvailableSlots(
  options: {
    childId?: string;
    doctorId?: string;
    date?: string;
    meetingType?: "in_person" | "online";
  },
) {
  const {
    childId,
    doctorId,
    date,
    meetingType = "in_person",
  } = options;

  return useQuery({
    queryKey: ["available-slots", childId, doctorId, date, meetingType],
    queryFn: async () => {
      if (!date) return [] as AvailableSlot[];

      if (childId) {
        const response = await apiClient.get<{
          date: string;
          meeting_type: string;
          appointment_duration_min: number;
          slots: AvailableSlot[];
        }>(
          `/users/children/${childId}/assigned-clinician/available-slots?date=${date}&meeting_type=${meetingType}`,
        );
        return (response.slots ?? []).filter((slot) => slot.is_available);
      }

      if (!doctorId) return [] as AvailableSlot[];

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
    enabled: !!date && (!!childId || !!doctorId),
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
  options: {
    childId?: string;
    doctorId?: string;
    from?: string;
    to?: string;
    meetingType?: "in_person" | "online";
  },
) {
  const {
    childId,
    doctorId,
    from,
    to,
    meetingType = "in_person",
  } = options;

  return useQuery({
    queryKey: ["available-days", childId, doctorId, from, to, meetingType],
    queryFn: async () => {
      if (!from || !to) return [] as AvailableDay[];

      if (childId) {
        const response = await apiClient.get<{
          child_id: string;
          doctor_id: string;
          from: string;
          to: string;
          meeting_type: string;
          days: AvailableDay[];
        }>(
          `/users/children/${childId}/assigned-clinician/available-days?from=${from}&to=${to}&meeting_type=${meetingType}`,
        );
        return response.days ?? [];
      }

      if (!doctorId) return [] as AvailableDay[];

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
    enabled: !!from && !!to && (!!childId || !!doctorId),
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
      queryClient.invalidateQueries({ queryKey: ["available-days"] });
    },
  });
}
