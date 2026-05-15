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
import { colors } from "../../shared/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In
    console.log("Google Sign-In pressed");
  };

  const handleEmailSignUp = () => {
    router.push("/(auth)/signup");
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "am" : language === "am" ? "om" : "en";
    setLanguage(nextLang);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />

      {/* Language Button replaced Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={toggleLanguage}>
        <Ionicons name="language" size={18} color={colors.primary} />
        <Text style={styles.skipText}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.message}>{t("auth.loginSubtitle")}</Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        {/* Login Button replaced Google Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Ionicons name="log-in-outline" size={20} color={colors.white} />
          <Text style={styles.loginButtonText}>{t("auth.login")}</Text>
        </TouchableOpacity>

        {/* Email Sign Up Button */}
        <TouchableOpacity
          style={styles.emailButton}
          onPress={handleEmailSignUp}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-add-outline"
            size={20}
            color="#1A365D"
            style={styles.emailIcon}
          />
          <Text style={styles.emailButtonText}>{t("auth.signup")}</Text>
        </TouchableOpacity>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
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
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  message: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A365D",
    lineHeight: 38,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: 18,
    borderRadius: 28,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 18,
    borderRadius: 28,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emailIcon: {
    marginRight: 4,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A365D",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E0",
  },
  dotActive: {
    backgroundColor: "#4A5568",
  },
});
