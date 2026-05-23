import { Toast, ToastType } from "@iqorlobanov/react-native-toast";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { ForgotPasswordPayload } from "../types";

export function useForgotPassword(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, ForgotPasswordPayload>,
    "mutationFn"
  >,
) {
  const router = useRouter();

  return useMutation<{ message: string }, Error, ForgotPasswordPayload>({
    mutationFn: authService.forgotPassword,
    onSuccess: (response) => {
      Toast.show({
        type: ToastType.SUCCESS,
        title: "Email sent",
        description:
          response.message ||
          "If the email exists, a password reset link has been sent.",
      });
      router.push("/(auth)/reset-password");
    },
    onError: (error: Error) => {
      Toast.show({
        type: ToastType.ERROR,
        title: "Error",
        description: error.message || "Failed to send reset email.",
      });
    },
    ...options,
  });
}
