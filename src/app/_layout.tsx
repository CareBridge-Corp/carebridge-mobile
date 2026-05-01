import { ToastComponent } from "@iqorlobanov/react-native-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { queryClient } from "../shared/api/queryClient";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <Stack screenOptions={{ headerShown: false }} />
      <ToastComponent />
    </QueryClientProvider>
  );
}
