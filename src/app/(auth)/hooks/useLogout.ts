import { useMutation } from "@tanstack/react-query";
import * as authService from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
    },
    onError: (error) => {
      // Still logout locally even if API call fails
      logout();
      console.error("Logout API call failed:", error);
    },
  });
}
