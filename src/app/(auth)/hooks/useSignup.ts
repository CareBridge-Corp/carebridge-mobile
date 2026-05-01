import { Toast, ToastType } from "@iqorlobanov/react-native-toast";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { AuthResponse, SignupCredentials } from "../types";

export function useSignup(
  options?: Omit<
    UseMutationOptions<AuthResponse, Error, SignupCredentials>,
    "mutationFn"
  >,
) {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation<AuthResponse, Error, SignupCredentials>({
    mutationFn: authService.register,
    onSuccess: async (response) => {
      if (response && response.token) {
        await SecureStore.setItemAsync("authToken", response.token);
        login(response.token, response.user);
      } else {
        Toast.show({
          type: ToastType.SUCCESS,
          title: "Success",
          description: "Registration successful! Please login.",
        });
        router.replace("/(auth)/login");
      }
    },
    onError: (error: Error) => {
      console.error("Signup failed:", error);
      Toast.show({
        type: ToastType.ERROR,
        title: "Error",
        description: error.message || "Registration failed.",
      });
    },
    ...options,
  });
}
