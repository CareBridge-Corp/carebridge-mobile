import { QueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 60 * 1000, // 1 minute default
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error: Error) => {
        Alert.alert("Error", error.message);
      },
    },
  },
});
