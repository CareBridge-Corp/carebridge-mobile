import { Toast, ToastType } from "@iqorlobanov/react-native-toast";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import { authService } from "../services/authService";
import { ResetPasswordPayload } from "../types";

export function useResetPassword(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, ResetPasswordPayload>,
    "mutationFn"
  >,
) {
  const router = useRouter();

  return useMutation<{ message: string }, Error, ResetPasswordPayload>({
    mutationFn: authService.resetPassword,
    onSuccess: (response) => {
      Toast.show({
        type: ToastType.SUCCESS,
        title: "Password updated",
        description:
          response.message ||
          "Password reset successful. Please log in with your new password.",
      });
      router.replace("/(auth)/login" as Href);
    },
    onError: (error: Error) => {
      Toast.show({
        type: ToastType.ERROR,
        title: "Error",
        description: error.message || "Failed to reset password.",
      });
    },
    ...options,
  });
}
