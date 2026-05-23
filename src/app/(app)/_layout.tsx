import { Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import { socketService } from "../../shared/api/socket";
import { initializePushNotifications } from "../../shared/services/pushNotifications";
import BottomNavigation from "./components/BottomNavigation";
import { useProfile } from "./hooks/useProfile";

export default function AppLayout() {
  useProfile();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    socketService.connect();
    initializePushNotifications();
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
