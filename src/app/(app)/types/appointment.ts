export interface AvailableSlot {
  start_time: string;
  end_time: string;
  schedule_id: string;
  is_available: boolean;
}

export interface Appointment {
  id?: string;
  appointmentId?: string;
  doctorId: string;
  parentId: string;
  childId?: string | null;
  scheduleId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  meetingType: "in_person" | "online";
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  meetingLink?: string | null;
  googleCalendarUrl?: string | null;
  googleEventId?: string | null;
  conferenceStatus: "not_required" | "not_connected" | "pending" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  schedule_id: string;
  parent_id: string;
  child_id?: string;
  appointment_date: string;
  start_time: string;
  meeting_type: "in_person" | "online";
  notes?: string;
}

export interface UpdateAppointmentStatusPayload {
  status: "cancelled" | "completed" | "no_show";
}
