import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { AuthError, LoginCredentials, AuthResponse } from "../types";
import * as SecureStore from 'expo-secure-store';

export function useLogin(
  options?: Omit<UseMutationOptions<AuthResponse, Error, LoginCredentials>, 'mutationFn'>
) {
  const { login } = useAuthStore();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: async (response) => {
      if (response.token) {
        await SecureStore.setItemAsync('authToken', response.token);
      }
      login(response.token, response.user);
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
    },
    ...options
  });
}
