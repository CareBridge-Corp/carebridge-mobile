export interface AvailableSlot {
  start_time: string;
  end_time: string;
  schedule_id: string;
  is_available: boolean;
}

export interface Appointment {
  appointmentId: string;
  doctorId: string;
  parentId: string;
  childId?: string | null;
  scheduleId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  meetingType: "in_person" | "online";
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
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
