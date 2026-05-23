import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";

export interface AppNotification {
  notificationId: string;
  userId: string;
  childId: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  message: string;
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  notifications: AppNotification[];
}

export function useNotifications(isRead?: boolean) {
  return useQuery({
    queryKey: ["notifications", isRead],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isRead !== undefined) {
        params.append("isRead", String(isRead));
      }
      const qs = params.toString();
      const response = await apiClient.get<NotificationsResponse>(
        `/notifications${qs ? `?${qs}` : ""}`,
      );
      return response;
    },
    refetchInterval: 30000,
  });
}

export function useUnreadNotificationCount() {
  const { data } = useNotifications(false);
  return data?.total ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) =>
      apiClient.post(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => apiClient.post("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export async function registerPushToken(fcmToken: string) {
  return apiClient.put("/users/me", { fcmToken });
}
