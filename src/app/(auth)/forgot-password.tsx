import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Screen,
  ScreenHeader,
  Text,
} from "../../shared/components/ui";
import { spacing } from "../../shared/theme";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll padded={false}>
      <ScreenHeader />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="display">
            {t("auth.forgotPasswordTitle", "Forgot password")}
          </Text>
          <Text variant="body" tone="secondary" style={styles.subtitle}>
            {t(
              "auth.forgotPasswordSubtitle",
              "Enter your email and we'll send you a reset link.",
            )}
          </Text>
        </View>

        <ForgotPasswordForm />
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
});
