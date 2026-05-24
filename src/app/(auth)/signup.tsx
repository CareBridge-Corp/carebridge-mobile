import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  IconButton,
  Screen,
  ScreenHeader,
  Text,
} from "../../shared/components/ui";
import { useLanguageStore } from "../../shared/store/languageStore";
import { spacing } from "../../shared/theme";
import { SignupForm } from "./components/SignupForm";

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const cycleLanguage = () => {
    const next = language === "en" ? "am" : language === "am" ? "om" : "en";
    setLanguage(next);
  };

  return (
    <Screen scroll padded={false}>
      <ScreenHeader
        rightSlot={
          <IconButton
            icon="language"
            variant="tinted"
            size="sm"
            accessibilityLabel="Change language"
            onPress={cycleLanguage}
          />
        }
      />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="display">{t("auth.signupTitle", "Create account")}</Text>
          <Text variant="body" tone="secondary" style={styles.subtitle}>
            {`Start your child's care journey in a few simple steps.`}
          </Text>
        </View>

        <SignupForm />

        <View style={styles.footer}>
          <Text variant="bodySmall" tone="secondary">
            {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
          </Text>
          <Text
            variant="bodySmall"
            weight="semibold"
            tone="brand"
            onPress={() => router.push("/(auth)/login")}
          >
            {t("auth.login", "Log in")}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  intro: {
    marginBottom: spacing[7],
  },
  subtitle: {
    marginTop: spacing[2],
    maxWidth: 320,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing[6],
    marginTop: spacing[4],
  },
});
