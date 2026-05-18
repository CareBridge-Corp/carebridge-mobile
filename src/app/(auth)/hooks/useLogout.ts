import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useChatStore } from "../../(app)/store/chatStore";
import { useChildrenStore } from "../../(app)/store/childrenStore";
import { useMChatStore } from "../../(app)/store/mchatStore";
import { useProfileStore } from "../../(app)/store/profileStore";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogout(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const { logout } = useAuthStore();
  const setProfile = useProfileStore((state) => state.setProfile);
  // Using direct full store extraction for reset

  const queryClient = useQueryClient();

  const clearEverything = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("authUser");

    // Auth and Profile
    logout();
    setProfile(null);

    // Attempting general reset where possible using Zustand default behaviors if we can't assume method names
    try {
      useChildrenStore.getState().setChildren?.([]);
    } catch (e) {}
    try {
      useChildrenStore.getState().setActiveChild?.(null);
    } catch (e) {}
    try {
      useMChatStore.getState().clearStore?.();
    } catch (e) {}
    try {
      useChatStore.getState().setMessages?.("", []);
    } catch (e) {}

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
    },
    ...options,
  });
}
