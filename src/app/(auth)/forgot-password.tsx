import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLanguageStore } from "../../shared/store/languageStore";
import { colors, spacing } from "../../shared/theme";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "am" : language === "am" ? "om" : "en";
    setLanguage(nextLang);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
        <Ionicons name="language" size={18} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ForgotPasswordForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: spacing.xl,
    zIndex: 10,
    padding: spacing.sm,
  },
  languageButton: {
    position: "absolute",
    top: 60,
    right: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});
