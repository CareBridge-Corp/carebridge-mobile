import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useProfileStore } from "../../(app)/store/profileStore";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogout(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const { logout } = useAuthStore();
  const setProfile = useProfileStore((state) => state.setProfile);
  const queryClient = useQueryClient();

  const clearEverything = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("authUser");
    logout();
    setProfile(null);
    queryClient.clear();
  };

  return useMutation<void, Error, void>({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await clearEverything();
    },
    onError: async (error) => {
      // Still logout locally even if API call fails
      await clearEverything();
      console.error("Logout API call failed:", error);
    },
    ...options,
  });
}
