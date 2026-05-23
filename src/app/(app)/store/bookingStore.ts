import { create } from "zustand";
import { Clinician } from "./clinicianStore";

export interface SelectedSlot {
  scheduleId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingState {
  doctor: Clinician | null;
  slot: SelectedSlot | null;
  meetingType: "in_person" | "online";
  childId: string | null;
}

interface BookingActions {
  setDoctor: (doctor: Clinician | null) => void;
  setSlot: (slot: SelectedSlot | null) => void;
  setMeetingType: (type: "in_person" | "online") => void;
  setChildId: (childId: string | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState & BookingActions>(
  (set) => ({
    doctor: null,
    slot: null,
    meetingType: "in_person",
    childId: null,
    setDoctor: (doctor) => set({ doctor }),
    setSlot: (slot) => set({ slot }),
    setMeetingType: (meetingType) => set({ meetingType }),
    setChildId: (childId) => set({ childId }),
    reset: () =>
      set({
        doctor: null,
        slot: null,
        meetingType: "in_person",
        childId: null,
      }),
  }),
);
