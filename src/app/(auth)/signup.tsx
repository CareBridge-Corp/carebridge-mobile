import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguageStore } from "../../shared/store/languageStore";
import { colors, spacing, typography } from "../../shared/theme";
import { SignupForm } from "./components/SignupForm";

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "am" : language === "am" ? "om" : "en";
    setLanguage(nextLang);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Language Button replaced Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={toggleLanguage}>
        <Ionicons name="language" size={18} color={colors.primary} />
        <Text style={styles.skipText}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      <SignupForm />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("auth.alreadyHaveAccount")} </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.footerLink}>{t("auth.login")}</Text>
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
  skipButton: {
    position: "absolute",
    top: 60,
    right: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
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
