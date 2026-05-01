import { Toast, ToastType } from "@iqorlobanov/react-native-toast";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
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
      }
      login(response.token, response.user);

      Toast.show({
        type: ToastType.SUCCESS,
        title: "Success",
        description: "Login successful!",
      });
      router.replace("/(app)" as Href);
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      Toast.show({
        type: ToastType.ERROR,
        title: "Error",
        description: error.message || "Login failed.",
      });
    },
    ...options,
  });
}
