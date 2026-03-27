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
import { SignupForm } from "./components/SignupForm";

export default function SignupScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <SignupForm />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.footerLink}>Login</Text>
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
