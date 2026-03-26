import { useMutation } from "@tanstack/react-query";
import * as authService from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { AuthError, LoginCredentials } from "../types";

export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (response) => {
      login(response.token, response.user);
    },
    onError: (error: AuthError) => {
      console.error("Login failed:", error);
    },
  });
}
