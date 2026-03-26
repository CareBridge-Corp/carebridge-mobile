import { Button, StyleSheet, Text, View } from "react-native";
import { useLogout } from "../(auth)/hooks/useLogout";
import { useAuthStore } from "../(auth)/store/authStore";

export default function AppHomeScreen() {
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CareBridge!</Text>
      {user && <Text style={styles.subtitle}>Hello, {user.name}</Text>}

      <Button
        title="Logout"
        onPress={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
});
