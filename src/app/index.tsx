import { Href, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuthStore } from "./(auth)/store/authStore";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome screen if not authenticated
      router.replace("/(auth)/welcome" as Href);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to app if authenticated
      router.replace("/(app)" as Href);
    } else if (!isAuthenticated && !inAuthGroup) {
      // Initial load - redirect to welcome
      router.replace("/(auth)/welcome" as Href);
    }
  }, [isAuthenticated, segments]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
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
