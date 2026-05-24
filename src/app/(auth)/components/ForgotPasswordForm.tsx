import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  TextField,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";
import { useForgotPassword } from "../hooks/useForgotPassword";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPassword();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = () => {
    forgotPasswordMutation.mutate({ email: email.trim() });
  };

  return (
    <View style={styles.container}>
      {forgotPasswordMutation.error && (
        <Card
          variant="flat"
          padding="md"
          style={{
            backgroundColor: colors.errorBackground,
            marginBottom: spacing[4],
          }}
        >
          <Text variant="bodySmall" tone="danger">
            {forgotPasswordMutation.error.message}
          </Text>
        </Card>
      )}

      <TextField
        label={t("auth.email", "Email")}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        leadingIcon="mail-outline"
      />

      <View style={styles.actions}>
        <Button
          label={t("auth.sendResetLink", "Send reset link")}
          onPress={handleSubmit}
          loading={forgotPasswordMutation.isPending}
          disabled={!email.trim()}
        />
        <Button
          label={t("auth.backToLogin", "Back to log in")}
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  actions: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
});
