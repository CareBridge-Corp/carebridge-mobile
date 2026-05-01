import { useMutation, UseMutationOptions } from "@tanstack/react-query";
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

  return useMutation<AuthResponse, Error, SignupCredentials>({
    mutationFn: authService.register,
    onSuccess: async (response) => {
      // API might only return user on register or also token
      if (response.token) {
        await SecureStore.setItemAsync("authToken", response.token);
        login(response.token, response.user);
      }
      // If backend doesn't return token, it requires manually redirecting to login.
      // This varies by flow, but we are mapping register correctly in authService.
    },
    onError: (error: Error) => {
      console.error("Signup failed:", error);
    },
    ...options,
  });
}
