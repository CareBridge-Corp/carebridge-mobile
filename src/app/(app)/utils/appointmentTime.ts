import type { Appointment } from "../types/appointment";

function parseAppointmentDateTime(date: string, time: string): Date {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}`);
}

export function getAppointmentWindow(appointment: Appointment): {
  start: Date;
  end: Date;
} {
  return {
    start: parseAppointmentDateTime(
      appointment.appointmentDate,
      appointment.startTime,
    ),
    end: parseAppointmentDateTime(
      appointment.appointmentDate,
      appointment.endTime,
    ),
  };
}

/** True if the appointment slot has not fully ended yet. */
export function isAppointmentUpcomingOrActive(
  appointment: Appointment,
  now = new Date(),
): boolean {
  const { end } = getAppointmentWindow(appointment);
  return end.getTime() >= now.getTime();
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Human-readable time status for join UI.
 * - before start: "Starts in …"
 * - during slot: "… left"
 * - after end: "Ended"
 */
export function getAppointmentTimeLeftLabel(
  appointment: Appointment,
  now = new Date(),
): string {
  const { start, end } = getAppointmentWindow(appointment);
  const nowMs = now.getTime();

  if (nowMs < start.getTime()) {
    return `Starts in ${formatDuration((start.getTime() - nowMs) / 1000)}`;
  }
  if (nowMs <= end.getTime()) {
    return `${formatDuration((end.getTime() - nowMs) / 1000)} left`;
  }
  return "Ended";
}
