import { useMutation } from "@tanstack/react-query";
import * as authService from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { AuthError, SignupCredentials } from "../types";

export function useSignup() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      authService.signup(credentials),
    onSuccess: (response) => {
      login(response.token, response.user);
    },
    onError: (error: AuthError) => {
      console.error("Signup failed:", error);
    },
  });
}
