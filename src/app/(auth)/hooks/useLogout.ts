import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from 'expo-secure-store';

export function useLogout(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>
) {
  const { logout } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await SecureStore.deleteItemAsync('authToken');
      logout();
    },
    onError: async (error) => {
      // Still logout locally even if API call fails
      await SecureStore.deleteItemAsync('authToken');
      logout();
      console.error("Logout API call failed:", error);
    },
    ...options
  });
}
