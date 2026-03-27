import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors, spacing, typography } from "../../shared/theme";
import { LoginForm } from "./components/LoginForm";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <LoginForm />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Didn't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: spacing.xl,
    zIndex: 10,
    padding: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.huge,
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  footerLink: {
    fontSize: typography.fontSize.sm,
    color: colors.textLink,
    fontWeight: typography.fontWeight.semibold,
  },
});
