import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Screen,
  ScreenHeader,
  Text,
} from "../../shared/components/ui";
import { spacing } from "../../shared/theme";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll padded={false}>
      <ScreenHeader />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="display">
            {t("auth.resetPasswordTitle", "Reset password")}
          </Text>
          <Text variant="body" tone="secondary" style={styles.subtitle}>
            {t(
              "auth.resetPasswordSubtitle",
              "Enter the token from your email and choose a new password.",
            )}
          </Text>
        </View>

        <ResetPasswordForm />
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
