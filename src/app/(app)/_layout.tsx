import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import BottomNavigation from "./components/BottomNavigation";
import { useProfile } from "./hooks/useProfile";

export default function AppLayout() {
  // Fetch and cache the profile on app start
  useProfile();

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
