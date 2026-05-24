import { Toast, ToastType } from "@iqorlobanov/react-native-toast";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  initializePushNotifications,
  showLocalNotification,
} from "../../../shared/services/pushNotifications";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { AuthResponse, LoginCredentials } from "../types";

export function useLogin(
  options?: Omit<
    UseMutationOptions<AuthResponse, Error, LoginCredentials>,
    "mutationFn"
  >,
) {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: async (response) => {
      if (response.token) {
        await SecureStore.setItemAsync("authToken", response.token);
        if (response.user) {
          await SecureStore.setItemAsync(
            "authUser",
            JSON.stringify(response.user),
          );
        }
      }
      login(response.token, response.user);
      await initializePushNotifications();

      // Fire a local notification so users can verify notifications work end-to-end.
      const firstName = response.user?.firstName?.trim();
      const greetingName = firstName ? `Welcome back, ${firstName}!` : "Welcome back!";
      await showLocalNotification(
        greetingName,
        "You're signed in to CareBridge. Tap to continue your child's care plan.",
      );

      Toast.show({
        type: ToastType.SUCCESS,
        title: "Success",
        description: "Login successful!",
      });
      router.replace("/(app)" as Href);
    },
    onError: (error: Error) => {
      // Login failed - error will be displayed in UI
      Toast.show({
        type: ToastType.ERROR,
        title: "Error",
        description: error.message || "Login failed.",
      });
    },
    ...options,
  });
}
