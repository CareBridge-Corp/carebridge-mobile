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

    // For UI design purposes, always go to app home after signup/login
    // Comment this out when you want to test auth flow
    setTimeout(() => {
      router.replace("/(app)" as Href);
    }, 100);
    return;

    // Original auth logic (commented for UI design)
    /*
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/welcome" as Href);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)" as Href);
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/welcome" as Href);
    }
    */
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
