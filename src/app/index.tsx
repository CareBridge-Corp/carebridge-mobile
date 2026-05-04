import { Href, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuthStore } from "./(auth)/store/authStore";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, login } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const userStr = await SecureStore.getItemAsync("authUser");
        if (token && userStr) {
          login(token, JSON.parse(userStr));
        }
      } catch (e) {
        // Failed to initialize auth - user will need to login
      } finally {
        setIsInitializing(false);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && !inAuthGroup) {
      router.replace("/(app)" as Href);
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/welcome" as Href);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)" as Href);
    }
  }, [isAuthenticated, segments, isInitializing, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
