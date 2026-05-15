import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Specialization {
  specializationId: string;
  name: string;
  description: string;
  riskLevelFocus: string;
}

export interface Clinician {
  userId: string;
  firstName: string;
  lastName: string;
  surname: string;
  email: string;
  status: string;
  licenseNumber: string;
  profilePictureUrl?: string;
  specializations: Specialization[];
}

interface ClinicianState {
  cliniciansByChild: Record<string, Clinician>;
  isLoading: boolean;
  error: string | null;
}

interface ClinicianActions {
  setClinicianForChild: (childId: string, clinician: Clinician) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useClinicianStore = create<ClinicianState & ClinicianActions>()(
  persist(
    (set) => ({
      cliniciansByChild: {},
      isLoading: false,
      error: null,

      setClinicianForChild: (childId, clinician) =>
        set((state) => ({
          cliniciansByChild: {
            ...state.cliniciansByChild,
            [childId]: clinician,
          },
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "carebridge-clinician-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
