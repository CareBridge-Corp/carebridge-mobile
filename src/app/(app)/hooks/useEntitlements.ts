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

export function getPaymentReturnUrls() {
  const apiBase =
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://192.168.64.115:5002";
  const deepLink = "carebridgemobile://payment-return";
  const bridgeUrl = `${apiBase}/payment-return?redirect=${encodeURIComponent(deepLink)}`;
  const authReturnUrl = `${apiBase}/payment-return`;

  return { apiBase, deepLink, bridgeUrl, authReturnUrl };
}

export async function initializePayment(input: {
  purpose: PaymentPurpose;
  appointmentId?: string;
  doctorId?: string;
}) {
  const { bridgeUrl, apiBase } = getPaymentReturnUrls();
  const callbackUrl = `${apiBase}/api/payments/webhook`;

  return apiClient.post<InitializePaymentResponse>("/payments/initialize", {
    purpose: input.purpose,
    appointment_id: input.appointmentId,
    doctor_id: input.doctorId,
    return_url: bridgeUrl,
    callback_url: callbackUrl,
  });
}

export interface VerifyPaymentResponse {
  message: string;
  payment?: { status: "PENDING" | "PAID" | "FAILED"; txRef?: string };
  entitlements?: UserEntitlements;
}

export async function verifyPayment(txRef: string) {
  return apiClient.get<VerifyPaymentResponse>(`/payments/verify/${txRef}`);
}
