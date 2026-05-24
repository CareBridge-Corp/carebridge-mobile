import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Button,
  Screen,
  Text,
} from "../../shared/components/ui";
import { useLanguageStore } from "../../shared/store/languageStore";
import { colors, layout, shadows, spacing } from "../../shared/theme";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo",
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const cycleLanguage = () => {
    const next = language === "en" ? "am" : language === "am" ? "om" : "en";
    setLanguage(next);
  };

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change language. Current: ${LANGUAGE_LABELS[language] ?? language}`}
          onPress={cycleLanguage}
          style={({ pressed }) => [
            styles.langChip,
            pressed && styles.langChipPressed,
          ]}
        >
          <Ionicons name="language" size={16} color={colors.primary} />
          <Text variant="caption" tone="brand">
            {LANGUAGE_LABELS[language] ?? language.toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Ionicons name="heart" size={28} color={colors.surface} />
        </View>

        <Text variant="caption" tone="brand" style={styles.eyebrow}>
          CareBridge
        </Text>

        <Text variant="display" align="left" style={styles.headline}>
          {t("auth.loginSubtitle", "Early support for your child's growth.")}
        </Text>

        <Text variant="body" tone="secondary" style={styles.subhead}>
          Screen, connect, and care — with guidance from trusted clinicians.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={t("auth.signup", "Create account")}
          onPress={() => router.push("/(auth)/signup")}
          trailingIcon="arrow-forward"
        />
        <Button
          label={t("auth.login", "I already have an account")}
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
        />

        <Text variant="caption" tone="tertiary" align="center" style={styles.footnote}>
          By continuing you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[2],
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.xs,
  },
  langChipPressed: {
    opacity: 0.85,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: layout.screenPadding,
    gap: spacing[3],
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
    ...shadows.md,
  },
  eyebrow: {
    marginBottom: spacing[1],
  },
  headline: {
    marginBottom: spacing[2],
  },
  subhead: {
    maxWidth: 320,
  },
  actions: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  footnote: {
    marginTop: spacing[2],
  },
});
