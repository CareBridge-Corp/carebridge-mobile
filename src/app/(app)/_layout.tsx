import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import BottomNavigation from "./components/BottomNavigation";

export default function AppLayout() {
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
