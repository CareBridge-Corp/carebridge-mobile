export interface Appointment {
  id: string;
  doctorId: string;
  parentId: string;
  childId?: string;
  scheduleId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  meetingType: "in_person" | "video";
  status: "confirmed" | "cancelled" | "completed" | "no_show" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  schedule_id: string;
  parent_id?: string;
  child_id?: string;
  appointment_date: string;
  start_time: string;
  meeting_type: "in_person" | "video";
}

export interface UpdateAppointmentStatusPayload {
  status: "cancelled" | "completed" | "no_show";
}
