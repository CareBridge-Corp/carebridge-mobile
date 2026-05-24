import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";

export interface UserEntitlements {
  hasActiveSubscription: boolean;
  subscriptionExpiresAt: string | null;
  childCount: number;
  paidChildSlots: number;
  canAddChild: boolean;
  canUseChat: boolean;
  canBookAppointments: boolean;
  canUseTreatment: boolean;
  pricing: {
    subscriptionAmount: string;
    extraChildAmount: string;
    appointmentAmount: string;
    currency: string;
  };
}

export function useEntitlements() {
  return useQuery({
    queryKey: ["entitlements"],
    queryFn: async () => {
      const response = await apiClient.get<{ entitlements: UserEntitlements }>(
        "/payments/entitlements",
      );
      return response.entitlements;
    },
    staleTime: 30000,
  });
}

export type PaymentPurpose = "SUBSCRIPTION" | "EXTRA_CHILD" | "APPOINTMENT";

interface InitializePaymentResponse {
  data?: { checkout_url?: string };
  checkout_url?: string;
  txRef?: string;
  status?: string;
  message?: string;
}

export async function initializePayment(input: {
  purpose: PaymentPurpose;
  appointmentId?: string;
  doctorId?: string;
}) {
  const apiBase =
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://192.168.64.115:5002";
  const returnUrl = `${apiBase}/payment-return?redirect=${encodeURIComponent("carebridgemobile://payment-return")}`;
  const callbackUrl = `${apiBase}/api/payments/webhook`;

  return apiClient.post<InitializePaymentResponse>("/payments/initialize", {
    purpose: input.purpose,
    appointment_id: input.appointmentId,
    doctor_id: input.doctorId,
    return_url: returnUrl,
    callback_url: callbackUrl,
  });
}

export async function verifyPayment(txRef: string) {
  return apiClient.get(`/payments/verify/${txRef}`);
}
